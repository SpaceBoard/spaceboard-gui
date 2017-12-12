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
    <div class="canvas-wrapper" ref="canvas-wrapper" v-touch:pan="onPanCam" v-touch:pinch="onZoom">

      <span v-if="root[using].items">
        <span

          :key="iBoxType"
          v-for="(boxType, iBoxType) in okeys(root[using].items)"
        >
          <Positioner
            :view="view"
            :xcam="camX"
            :ycam="camY"
            :width="box.size.width"
            :height="box.size.height"
            :deep="box.pos.z"
            :xpos="box.pos.x"
            :ypos="box.pos.y"
            :scaler="scaler"
            :pannerStart="() => { handleItemDraggerStart() }"
            :pannerEnd="() => { handleItemDraggerEnd() }"
            :panner="(evt) => { handleItemDragger({ item: box, evt }) }"
            :key="iBox"
            v-for="(box, iBox) in root[using].items[boxType]"
          >
            <div :style="{
              color: 'red',
              width: '200px',
              height: '200px',
              background: 'white',
              border: 'black solid 1px'
            }">123</div>
          </Positioner>
        </span>
      </span>



    </div>
  </div>
  <div class="drawer" :class="{ 'is-open': isOpen }">

  </div>

</div>
</template>

<script>
import * as Data from '@/components/parts/Editor/Data/DataStructure.js'
import Positioner from '@/components/parts/Editor/Positioner/Positioner.vue'
import UIEvents from '@/components/parts/Editor/UIEvents/UIEvents.js'

export default {
  components: {
    Positioner
  },
  data () {
    return {
      okeys: Object.keys,
      using: 'realtime',
      root: {
        realtime: {},
        timetravel: {},
        timemachine: []
      },

      camStack: {},
      camapis: false,
      view: {
        x0: 0,
        y0: 0,
        x1: window.innerWidth - 300,
        y1: window.innerHeight - 56
      },
      cam: {
        pause: false,
        _dx: 0,
        _dy: 0,
        _x: 0,
        _y: 0,
        x: 0,
        y: 0
      },
      scaler: 1.0,
      scaleState: {
        ts: 0,
        ds: 0
      },
      isOpen: false,
      inertia: 1.0
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
  methods: {
    handleItemDraggerStart () {
      this.cam.pause = true
    },
    handleItemDraggerEnd () {
      this.cam.pause = false
    },
    handleItemDragger ({ item, evt }) {
      var factor = (window.navigator.userAgent.indexOf('Chrome') !== -1) ? 1.0 : 0.5
      item.pos.x += evt.velocityX * (16.6667) * factor
      item.pos.y += evt.velocityY * (16.6667) * factor

      this.inertia = 0.0
      this.cam._dx = 0.0
      this.cam._dy = 0.0
    },
    onZoom (evt) {
      this.scaler = evt.scale
      this.cam._dx = 0
      this.cam._dy = 0
    },
    onPanCam (evt) {
      if (this.cam.pause) { return }
      var factor = (window.navigator.userAgent.indexOf('Chrome') !== -1) ? 1.0 : 0.5
      this.cam._dx = evt.velocityX * (16.6667) * factor
      this.cam._dy = evt.velocityY * (16.6667) * factor

      this.inertia = 1.1
    }
  },
  mounted () {
    setTimeout(() => {
      this.root[this.using] = {
        attention: {
          x: 150,
          y: 150
        },
        items: {
          textBoxes: [
            Data.textBox({ pos: { x: 10, y: 10, z: 0 } }),
            Data.textBox({ pos: { x: 110, y: 110, z: 0 } })
          ]
        }
      }
      this.cam._x = this.root[this.using].attention.x
      this.cam._y = this.root[this.using].attention.y
    }, 500)
    var self = this
    function rAF () {
      if (self.inertia > 0.0001) {
        self.cam._x += self.cam._dx * self.inertia
        self.cam._y += self.cam._dy * self.inertia
      }
      self.inertia *= 0.97
      self.rAFID = window.requestAnimationFrame(rAF)
    }
    this.rAFID = window.requestAnimationFrame(rAF)
    this.camapis = UIEvents({ target: this.$refs['canvas-wrapper'], stack: this.camStack })
    this.camStack.onPanCamCam = ({ type, deltaX, deltaY }) => {
      if (type === 'wheel') {
        this.cam._x -= (deltaX / this.scaler)
        this.cam._y -= (deltaY / this.scaler)
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
  margin-left: 30px;
  height: 36px;
  width: 250px;
}
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  border: 1px solid #000000;
  height: 24px;
  width: 24px;
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
