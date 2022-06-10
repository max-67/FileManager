const fs = require('fs');
const express = require('express');
const path = require('path');
const moment = require('moment');

const app = express();
app.use(express.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:8080"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post("/getDir", (req, res) => {
  const obj = {
    dir: [],
    files: []
  };
  let current_path = `${path.resolve()}`;
  if (req.body.path) {
    current_path = `${req.body.path}`;
  }
  new Promise ((resolve, reject) => {
    fs.readdir(current_path, async(err, files) => {
      for (let i = 0; i < files.length; i++) {
        if (fs.lstatSync(`${current_path}/${files[i]}`).isDirectory()) {
          await getSize(`${current_path}/${files[i]}`).then(function(size){
            size = formatSize(size);
            const changedate = new Date(fs.lstatSync(`${current_path}/${files[i]}`).ctime);
            obj.dir.push({file_name: files[i], file_size: size, file_date: moment(changedate).format("DD.MM.YYYY HH:mm:ss")});
          })
        }
        else if (fs.lstatSync(`${current_path}/${files[i]}`).isFile()) {
          const changedate = new Date(fs.lstatSync(`${current_path}/${files[i]}`).ctime);
          const file_size = fs.lstatSync(`${current_path}/${files[i]}`).size;
          size = formatSize(file_size);
          obj.files.push({file_name: files[i], file_size: size, file_date: moment(changedate).format("DD.MM.YYYY HH:mm:ss")});
        }
      }
      resolve();
    });
  }).then(() => {
    res.send([obj, current_path]);
  })
});

app.post('/createFolder', (req, res) => {
  const current_path = req.body.path;
  fs.mkdir(`${current_path}/${req.body.folderName}`, err => {
    if(err) throw err;
    res.send('ok');
 });
});

app.post('/deleteFolder', (req, res) => {
  let current_path = `${path.resolve()}`;
  if (req.body.path) {
    current_path = `${req.body.path}`;
  }
  const files = req.body.files;
  new Promise((resolve, reject) => {
    for (let i = 0; i < files.length; i++) {
      if (!fs.lstatSync(`${current_path}/${files[i]}`).isDirectory()) {
        fs.rm(`${current_path}/${files[i]}`, err => {
          if(err) throw err;
        });
      } else {
        fs.rmdir(`${current_path}/${files[i]}`, err => {
          if(err) throw err;
        });
      }
    }
  })
  res.send('ok');
});

app.post('/copy', async(req, res) => {
  const fromPath = req.body.from;
  const toPath = req.body.to;
  const files = req.body.files;
  new Promise ((resolve, reject) => {
    for (let i = 0; i < files.length; i++) {
      fs.access(`${toPath}/${files[i]}`, async(err) => {
        if (err) {
          fs.copyFile(`${fromPath}/${files[i]}`, `${toPath}/${files[i]}`, err => {
            if(err) throw err;
         });
        }
      })
    }
  })
  res.send('ok');
});

app.post('/move', (req, res) => {
  const fromPath = req.body.from;
  const toPath = req.body.to;
  const files = req.body.files;
  for (let i = 0; i < files.length; i++) {
    fs.rename(`${fromPath}/${files[i]}`, `${toPath}/${files[i]}`, err => {
      if(err) throw err;
    });
  }
  res.send('ok');
})

function formatSize(length) {
  var i = 0, type = ['б','Кб','Мб','Гб','Тб','Пб'];
  while((length / 1000 | 0) && i < type.length - 1) {
      length /= 1024;
      i++;
  }
  return length.toFixed(2) + ' ' + type[i];
}

async function getSize(dirPath){      
  const stat = await getStat(dirPath);
  if (stat.isFile()) {
    return stat.size;
  } else if (stat.isDirectory()) {
    return getFiles(dirPath).then(function (files) {
      var promises = files.map(function (file) {
        return path.join(dirPath, file);
      }).map(getSize);
      return Promise.all(promises);
    }).then(function (childElementSizes) {
      var dirSize = 0;
      childElementSizes.forEach(function (size) {
        if (size != NaN && size != undefined) {
          dirSize += size;
        }
      });
      return dirSize;
    });
  }
}

function getStat(filePath){
  return new Promise(function(resolve, reject){
    fs.lstat(filePath, function(err, stat){
      if(err) return reject(err);
      resolve(stat);
    });
  });
}

function getFiles(dir){
  return new Promise(function(resolve, reject){
    fs.readdir(dir, function(err, stat){
      if(err) return reject(err);
      resolve(stat);
    });
  });  
}

app.listen(3000, () => {
  console.log('Server start on port - 3000');
});