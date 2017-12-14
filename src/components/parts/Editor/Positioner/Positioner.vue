<template>
<div class="app-window" v-if="readVisiblity" :style="{
  display: readDisplay,
  position: 'absolute',
  transform: 'perspective(100vmax) translate3d(' + (readXPos) + 'px,' + (readYPos) + 'px' + ', '+ (deep + 1) +'px)' + ' scale(' + scaler + ')',
  transformOrigin: '0% 0%',
  top: 0 + 'px',
  left: 0 + 'px',
  width: width + 'px',
  height: height + 'px'
}">
  <div class="handler"
  :style="{
    position: 'absolute',
    top: '0px',
    left: '0px',
    transformOrigin: '0% 0%',
    transform: 'perspective(100vmax) translate3d(' + (0) + 'px,' + (0) + 'px' + ', '+ 2 +'px)' + ' scale(' + 1.0 + ')',
  }"
  v-touch:panend="pannerEnd"
  v-touch:panstart="pannerStart"
  v-touch:pan="panner">
    <img src="./img/mover.svg" class="mover" draggable="false" />
  </div>

  <div class="handler"
  :style="{
    position: 'absolute',
    top: '0px',
    right: '0px',
    transformOrigin: '0% 0%',
    transform: 'perspective(100vmax) translate3d(' + (0) + 'px,' + (0) + 'px' + ', '+ 2 +'px)' + ' scale(' + 1.0 + ')',
  }"
  v-touch:tap="() => { $emit('remove') }"
  >
    <img src="./img/remover.svg" class="mover" draggable="false" />
  </div>
  <div class="app-area" :style="{
      width: width + 'px',
      height: (height - offsetY) + 'px',
    }">
    <slot></slot>
  </div>
</div>
</template>

<script>
export default {
  props: {
    offsetY: {
      default: 50
    },
    pannerStart: {
      default () { return () => {} }
    },
    pannerEnd: {
      default () { return () => {} }
    },
    deep: {
      default: 1.0
    },
    view: {
      default () {
        return {
          x0: 0,
          y0: 0,
          x1: window.innerWidth - 300,
          y1: window.innerHeight - 56,
          offsetX: 300,
          offsetY: 56
        }
      }
    },
    panner: {
      default () {
        return () => {}
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
  data () {
    return {

    }
  },
  computed: {
    readXPos () {
      // center zoom
      return (this.xcam + this.xpos - this.view.x1 * 0.5) * this.scaler + this.view.x1 * 0.5
    },
    readYPos () {
      // center zoom
      return (this.ycam + this.ypos - this.view.y1 * 0.5) * this.scaler + this.view.y1 * 0.5
    },
    readVisiblity () {
      var ans = true
      var view = this.view
      var x0 = this.readXPos
      var y0 = this.readYPos
      var x1 = (this.readXPos + this.width * this.scaler)
      var y1 = (this.readYPos + this.height * this.scaler)

      var x2 = x0 + this.width * this.scaler
      var y2 = y0 + this.height * this.scaler

      if (
        (x2 < 0 || y2 < 0) ||
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

<style scoped>
.handler{
  cursor: move;
  width: 45px;
  height: 45px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.mover{
  width: 30px;
  height: 30px;
}

.app-window{
  border: grey solid 1px;
  background-color: rgba(255,255,255,0.2);
}

.app-area{
  border-top: 1px solid grey;
  margin-top: 50px;
}
</style>
