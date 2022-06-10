<template>
  <div id="app">
    <Filemanager/>
  </div>
</template>

<script>

import Filemanager from './components/Filemanager/Filemanager.vue';

export default {
  name: 'App',
  components: {
    Filemanager
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin-top: 60px;
}
</style>
