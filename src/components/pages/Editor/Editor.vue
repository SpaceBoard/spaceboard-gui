<template>
<div class="wrapper">
  <div class="toolbar">
    <input class="scale-ranger" type="range" step="0.000001" min="0.1" max="5" v-model="scaler" />
    <div class="btns">
      <div class="btn btn-movable">Upload File <img class="dragger" src="./img/icons/mover.svg" /></div>
      <div class="btn btn-movable">Picture + Annotation <img class="dragger" src="./img/icons/mover.svg" /></div>
      <div class="btn btn-movable">Realtime Drawboard <img class="dragger" src="./img/icons/mover.svg" /></div>
      <div class="btn btn-movable">Comment Box <img class="dragger" src="./img/icons/mover.svg" /></div>
      <div class="btn btn-movable">Text Box <img class="dragger" src="./img/icons/mover.svg" /></div>
    </div>
  </div>
  <div class="canvas-area">
    <div class="canvas-wrapper" ref="canvas-wrapper">

      <Positioner
        :view="view"
        :xcam="camX"
        :ycam="camY"

        :deep="0"
        :xpos="10"
        :ypos="10"
        :scaler="scaler"
      >
        <div :style="{
          color: 'red',
          width: '100px',
          height: '100px',
          background: 'white',
          border: 'black solid 1px'
        }">123</div>
      </Positioner>
      <Positioner
        :view="view"
        :xcam="camX"
        :ycam="camY"

        :deep="0"
        :xpos="100"
        :ypos="100"
        :scaler="scaler"
      >
        <div :style="{
          color: 'red',
          width: '100px',
          height: '100px',
          background: 'white',
          border: 'black solid 1px'
        }">123</div>
      </Positioner>

    </div>
  </div>
  <div class="drawer" :class="{ 'is-open': isOpen }">

  </div>

</div>
</template>

<script>
import Positioner from '@/components/parts/Editor/Positioner/Positioner.vue'
import UIEvents from '@/components/parts/Editor/UIEvents/UIEvents.js'

export default {
  components: {
    Positioner
  },
  data () {
    return {
      camStack: {},
      camapis: false,
      view: {
        x0: 0,
        y0: 0,
        x1: window.innerWidth - 300,
        y1: window.innerHeight - 56
      },
      cam: {
        _x: 0,
        _y: 0,
        x: 0,
        y: 0
      },
      scaler: 1.0,
      isOpen: false
    }
  },
  computed: {
    camX () {
      return this.cam._x / this.scaler
    },
    camY () {
      return this.cam._y / this.scaler
    }
  },
  mounted () {
    this.camapis = UIEvents({ target: this.$refs['canvas-wrapper'], stack: this.camStack })
    this.camStack.onPanCam = ({ type, deltaX, deltaY }) => {
      if (type === 'inertia') {
        this.cam._x += this.camapis.state.dx
        this.cam._y += this.camapis.state.dy
      }
      if (type === 'wheel') {
        this.cam._x -= deltaX / this.scaler
        this.cam._y -= deltaY / this.scaler
      }
    }
    window.addEventListener('resize', () => {
      this.view = {
        x0: 0,
        y0: 0,
        x1: window.innerWidth - 300,
        y1: window.innerHeight - 56
      }
    })
  },
  beforeDestroy () {
    this.camapis.uninstall()
  }
}
</script>

<style scoped>
.scale-ranger{
  width: 250px;
}
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  border: 1px solid #000000;
  height: 36px;
  width: 16px;
  border-radius: 3px;
  transform: scale(2.0);
  background: #ffffff;
  cursor: pointer;
  margin-top: 0px; /* You need to specify a margin in Chrome, but in Firefox and IE it is automatic */
  box-shadow: 0px 0px 0px transparent, 0px 0px 0px transparent; /* Add cool effects to your sliders! */
}

.wrapper{
  overflow: hidden;
  position: relative;
  height: calc(100% - 56px);
  width: 100%;
}
.toolbar{
  position: absolute;
  top: 0px;
  left: 0px;
  height: calc(100% - 56px * 0.0);
  width: 300px;
  background-color: #bababa;
}
.btns{
  flex-wrap: wrap;
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
}
.btn{
  position: relative;
  width: calc(100% - 40px);
  line-height: 56px;
  height: 56px;
  background-color: #2087ff;
  color: white;
  font-size: 20px;
  text-align: left;
  padding: 0px 0px 0px 15px;
  margin: 15px 0px 0px 0px;
}

.canvas-wrapper{
  overflow: hidden;
  transform-style: preserve-3d;
  position: relative;
  width: 100%;
  height: 100%;
}

.canvas-area{
  perspective: 100vmax;
  position: absolute;
  top: 0px;
  left: 300px;
  width: calc(100% - 300px);
  height: calc(100% - 56px * 0.0);
  background: rgba(0,0,255,0.2);
}
.drawer{
  position: absolute;
  top: 0px;
  left: 400px;
  width: 100%;
  height: calc(100% - 56px * 0.0);
  transform: translateX(100%);
  background-color: rgba(255,255,255,0.2);
}
.drawer.is-open{
  transform: translateX(0);
}
.dragger {
  position: absolute;
  right: 10px;
  top: 10px;
}
</style>
