<template>
  <textarea ref="ta"
   class="box textarea can-do-default" v-model="box.data.text"></textarea>
</template>

<script>
export default {
  props: {
    box: {}
  },
  data () {
    return {
      size: {
        ...this.$options.info.size
      }
    }
  },
  info: {
    size: { width: 300, height: 200 }
  },
  mounted () {
  },
  methods: {
    // onPan (evt) {
    //   var div = this.$refs['convo']
    //   div.scrollAmount = div.scrollAmount || div.scrollTop
    //   var factor = (window.navigator.userAgent.indexOf('Chrome') !== -1) ? 1.0 : 0.5
    //   // item.pos.x += evt.velocityX * (16.6667) * factor / this.scaler
    //   div.scrollAmount -= evt.velocityY * (16.6667) * factor / this.cam.scaler
    //   div.scrollTop = div.scrollAmount
    // }
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
  -webkit-overflow-scrolling: touch;
}
</style>
