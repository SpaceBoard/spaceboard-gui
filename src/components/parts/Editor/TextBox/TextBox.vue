<template>
  <textarea ref="ta" class="box textarea can-do-default" v-model="box.data.text"></textarea>
</template>

<script>
export default {
  props: {
    box: {}
  },
  info: {
    size: { width: 300, height: 200 }
  }
}
</script>

<style scoped>
.box{
  /* background-color: rgba(255,255,255,0.2); */
}

.textarea{
  font-size: 20px;
  -webkit-appearance: none;
  border: none;
  background: transparent;
  outline: none;
  width: calc(100% - 3px);
  height: calc(100% - 5px);
}
</style>
