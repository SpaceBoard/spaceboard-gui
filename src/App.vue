<template>
  <div id="app">
    <header>
      <span class="brand"><router-link tag="span" to="/">SpaceBoard</router-link> <span class="app-author">made with love by <a href="https://twitter.com/wonglok831">loklok</a> and <a href="https://k2.digital">k2.digital</a></span></span>
    </header>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style>
html,
body {
  margin: 0;
  height: 100%;
}
.app-author{
  font-size: 13px;
}
.app-author a,
.app-author a:visited,
.app-author a:active,
.app-author a:hover {
  color: #ffffff;
  text-decoration: underline;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100%;
}

header {
  margin: 0;
  height: 56px;
  padding: 0 16px 0 24px;
  background-color: #35495E;
  color: #ffffff;
}

header span.brand {
  display: block;
  position: relative;
  font-size: 20px;
  line-height: 1;
  letter-spacing: .02em;
  font-weight: 400;
  box-sizing: border-box;
  padding-top: 16px;
}
</style>
