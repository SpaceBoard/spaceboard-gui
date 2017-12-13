<template>
  <textarea ref="ta" class="box textarea" v-model="box.data.text"></textarea>
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
  background-color: rgba(255,255,255,0.2);
}

.textarea{
  font-size: 20px;
  -webkit-appearance: none;
  border: none;
  outline: none;
  width: 100%;
  height: 100%;
}
</style>
