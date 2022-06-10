<template>
  <div class="filemanager">
    <h1>Файловый менеджер</h1>
    <div class="container">
      <ListFiles ref="childComponent1" @dataFiles="dataFiles" @current_path="changePath"></ListFiles>
      <ListFiles ref="childComponent2" @dataFiles="dataFiles" @current_path="changePath"></ListFiles>
      <button class="button" v-on:click="copy">Скопировать</button>
      <button class="button" v-on:click="move">Переместить</button>
      <button disabled id="buttonPaste" class="button" v-on:click="paste">Вставить</button>
      <button id="buttonRemove" class="button" v-on:click="remove">Удалить</button>
    </div>
  </div>
</template>

<script>
  import axios from 'axios';
  import ListFiles from './ListFiles.vue';
  export default {
    name: "Filemanager",
    components: {
      ListFiles
    },
    data() {
      return {
        from_path: '',
        markedFiles: [],
        current_path: '',
        is_move: false,
        buttonPaste: ''
      }
    },
    methods: {
      changePath(data) {
        this.current_path = data.current_path;
      },
      dataFiles(data) {
        this.markedFiles = data.files;
        this.from_path = data.from_path;
      },
      remove() {
        axios.post('http://localhost:3000/deleteFolder',{
          files: this.markedFiles,
          path: this.current_path
        }).then(() => {
          this.markedFiles = [];
          this.loadFiles();
        });
      },
      copy() {
        this.buttonPaste.disabled = false;
      },
      move() {
        this.is_move = true;
        this.buttonPaste.disabled = false;
      },
      async paste() {
        if (this.is_move) {
          await axios.post('http://localhost:3000/move',{
            from: this.from_path,
            to: this.current_path,
            files: this.markedFiles
          });
          this.is_move = false;
        } else {
          await axios.post('http://localhost:3000/copy',{
            from: this.from_path,
            to: this.current_path,
            files: this.markedFiles
          });
        }
        this.buttonPaste.disabled = true;
        this.loadFiles();  
      },
      loadFiles() {
        this.$refs.childComponent1.markedFiles = [];
        this.$refs.childComponent2.markedFiles = [];
        this.$refs.childComponent1.getFiles();
        this.$refs.childComponent2.getFiles();
      }
    },
    mounted() {
      this.buttonPaste = document.querySelector('#buttonPaste');
    }
  }
</script>