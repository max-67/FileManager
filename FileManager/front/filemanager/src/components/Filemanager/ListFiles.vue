<template>
  <div>
    <div class="pathLabel">Путь:</div>
    <div class="path">
      {{path}}
    </div>
    <button id="buttonBack" class="button" v-on:click="back">Назад</button>
    <div class="files_content">
      <table class="table">
        <tr>
          <td>Имя файла</td>
          <td>Размер</td>
          <td>Дата</td>
        </tr>
        <tr class="file" v-for="i in files.dir" :key=i>
          <td>
            <input type="checkbox" :value="i.file_name" v-model="markedFiles">
              <div :class="icon_folder"></div>
            <span v-on:click="open(i.file_name)">{{i.file_name}}</span>
          </td>
          <td>
            <span>{{i.file_size}}</span>
          </td>
          <td>{{i.file_date}}</td>
        </tr>
        <tr class="file" v-for="i in files.files" :key=i>
          <td>
            <input type="checkbox" :value="i.file_name" v-model="markedFiles">
            <div :class=i.icon_class></div>
            <span>{{i.file_name}}</span>
          </td>
          <td>
            <span>{{i.file_size}}</span>
          </td>
          <td>{{i.file_date}}</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
  import axios from 'axios';
  export default {
    name: "ListFiles",
    components: {
    },
    props: {
    },
    data() {
      return {
        markedFiles: [],
        files: [],
        path: '',
        icon_folder: 'icon-folder'
      }
    },
    watch: {
      path: function() {
        this.$emit('current_path', {
          current_path: this.path
        })
      },
      markedFiles: function() {
        this.$emit('dataFiles', {
          files: this.markedFiles,
          from_path: this.path
        })
      },
    },
    methods: {
      open(folder) {
        this.getFiles(`${this.path}/${folder}`);
      },
      back() {
        this.getFiles(this.path.substr(0, this.path.lastIndexOf('/')));
      },
      getFiles(path) {
        let targetPath = this.path;
        if (path) {
          targetPath = path;
        }
        axios.post('http://localhost:3000/getDir',{
          path: targetPath
        }).then((result) => {
          this.files = result.data[0];
          this.path = result.data[1];
          this.getFilesIcon();
        });
      },
      getFilesIcon() {
        for (let i = 0; i < this.files.files.length; i ++) {
          const file = this.files.files[i].file_name;
          switch (file.substr(file.lastIndexOf('.')+1, file.length)) {
            case 'jpeg':  this.files.files[i].icon_class = 'icon-image'; break;
            case 'jpg': this.files.files[i].icon_class = 'icon-image'; break;
            case 'mp3': this.files.files[i].icon_class = 'icon-music'; break;
            default: this.files.files[i].icon_class = 'icon-documents'; break;
          }
        }
      }
    },
    mounted() {
      this.getFiles();
    }
  }
</script>