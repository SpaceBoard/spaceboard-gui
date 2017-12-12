<template>
<div v-if="readVisiblity" :style="{
  display: readDisplay,
  position: 'absolute',
  transform: 'perspective(100vmax) translate3d(' + (readXPos) + 'px,' + (readYPos) + 'px' + ', '+ deep +'px)' + ' scale(' + scaler + ')',
  transformOrigin: '0% 0%',
  top: '0px',
  left: '0px',
  width: width + 'px',
  height: height + 'px',
  color: 'red'
}"><slot></slot></div>
</template>

<script>
export default {
  props: {
    deep: {
      default: 1.0
    },
    view: {
      default () {
        return {
          x0: 0,
          y0: 0,
          x1: window.innerWidth - 300,
          y1: window.innerHeight - 56
        }
      }
    },
    ycam: {
      default: 10
    },
    xcam: {
      default: 10
    },
    ypos: {
      default: 10
    },
    xpos: {
      default: 10
    },
    width: {
      default: 100
    },
    height: {
      default: 100
    },
    scaler: {
      default: 1
    }
  },
  computed: {
    readXPos () {
      return (this.xcam + this.xpos) * this.scaler
    },
    readYPos () {
      return (this.ycam + this.ypos) * this.scaler
    },
    readVisiblity () {
      var ans = true
      var view = this.view
      var x0 = this.readXPos
      var y0 = this.readYPos
      var x1 = (this.readXPos + this.width * this.scaler)
      var y1 = (this.readYPos + this.height * this.scaler)

      if (
        (x0 > view.x1 || y0 > view.y1) ||
        (x1 < view.x0 || y1 < view.y0)
      ) {
        ans = false
      }
      return ans
    },
    readDisplay () {
      var ans = this.readVisiblity
      if (ans) {
        return 'block'
      } else {
        return 'none'
      }
    }
  }
}
</script>

<style>

</style>
