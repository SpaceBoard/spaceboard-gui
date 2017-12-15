<template>
<div class="wrapper">
  <div class="canvas-area">
    <div class="canvas-wrapper" ref="canvas-wrapper" v-touch:doubletap="() => {}">
      <div class="canvas-toucher" ref="canvas-toucher" v-touch:pan="onPanCam"  v-touch:pinch="onZoom" v-touch:pinchstart="onZoomStart" v-touch:pinchend="onZoomEnd"></div>

      <div v-if="root[using].items">
        <div
          :key="iBoxType"
          v-for="(boxType, iBoxType) in okeys(root[using].items)"
        >
          <Positioner
            :offsetY="50"
            :view="view"
            :xcam="camX"
            :ycam="camY"
            :size="box.size"
            :width="box.size.width"
            :height="box.size.height"
            :deep="box.pos.z"
            :xpos="box.pos.x"
            :ypos="box.pos.y"
            :scaler="scaler"
            :pannerStart="() => { handleItemDraggerStart() }"
            :pannerEnd="() => { handleItemDraggerEnd() }"
            :panner="(evt) => { handleItemDragger({ item: box, evt }) }"
            @remove="(evt) => { onRemoveBox({ arrayName: box.arrayName, id: box.id }) }"
            :key="iBox"
            v-for="(box, iBox) in root[using].items[boxType]"
          >
            <component
              @pulse-update="() => { onItemPulse({ arrayName: box.arrayName, id: box.id, spaceID: root.realtime.id, item: box }) }"
              @hover="(v) => { hover = v }"
              v-bind:is="box.component"
              :cam="cam"
              :box="box"
              :view="view"
              :offsetY="50"
              :user="{ uid: 'user2', name: 'dai ming' }"
            ></component>
          </Positioner>
        </div>
      </div>


    </div>
  </div>
  <div class="drawer" :class="{ 'is-open': isOpen }">

  </div>
  <div class="toolbar">
    <input class="scale-ranger" type="range" step="0.000001" min="0.1" max="5" v-model="scaler" />
    <div>
      <img src="./img/icon/mark-cam.svg" @click="() => { markCam(); }" />
      <img src="./img/icon/reset-cam.svg" @click="() => { restoreCam(); }" />
      <img src="./img/icon/download.svg" @click="() => { saveRoot(); }" />
    </div>
    <div>
      <transition name="fade">
        <h3 v-if="message.markCam">{{ message.markCam }}</h3>
      </transition>
      <transition name="fade">
        <h3 v-if="message.restoreBox" @click="onBoxRestore()" >{{ message.restoreBox }}<button @click="onBoxRestore()" >Restore</button></h3>
      </transition>
    </div>
    <div class="btns">
      <SourceButton @drop="createNewOnDrop" fileType="textBox"> Text Box </SourceButton>
      <SourceButton @drop="createNewOnDrop" fileType="file"> Upload File </SourceButton>
      <SourceButton @drop="createNewOnDrop" fileType="picture"> Picture + Annotation </SourceButton>
      <SourceButton @drop="createNewOnDrop" fileType="drawboard"> Realtime Drawboard </SourceButton>
      <SourceButton @drop="createNewOnDrop" fileType="commentBox"> Comment Box </SourceButton>
      <!-- <div class="btn btn-movable">Upload File <img class="dragger" src="./img/icons/mover.svg" /></div>
      <div class="btn btn-movable">Picture + Annotation <img class="dragger" src="./img/icons/mover.svg" /></div>
      <div class="btn btn-movable">Realtime Drawboard <img class="dragger" src="./img/icons/mover.svg" /></div>
      <div class="btn btn-movable">Comment Box <img class="dragger" src="./img/icons/mover.svg" /></div>
      <div class="btn btn-movable">Text Box <img class="dragger" src="./img/icons/mover.svg" /></div> -->
    </div>
  </div>


</div>
</template>

<script>
import * as Pulse from '@/components/parts/Editor/Data/Pulse.js'
import * as Data from '@/components/parts/Editor/Data/DataStructure.js'
import Positioner from '@/components/parts/Editor/Positioner/Positioner.vue'
import SourceButton from '@/components/parts/Editor/SourceButton/SourceButton.vue'
import Drawboard from '@/components/parts/Editor/Drawboard/Drawboard.vue'
import TextBox from '@/components/parts/Editor/TextBox/TextBox.vue'
import CommentBox from '@/components/parts/Editor/CommentBox/CommentBox.vue'
import TWEEN from '@tweenjs/tween.js'

function capLetter (string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
Pulse.onCreateItem({ item: {}, arrayName: 'abc' })

export default {
  components: {
    Positioner,
    SourceButton,
    TextBox,
    Drawboard,
    CommentBox
  },
  data () {
    return {
      hover: false,
      capLetter,
      message: {
        markCam: false
      },
      okeys: Object.keys,
      using: 'realtime',
      root: {
        // currnet file
        realtime: {},
        // temp obj for time travelling
        timetravel: {},
        // backups
        timemachine: []
      },
      temp: {
        box: false
      },
      view: {
        x0: 0,
        y0: 0,
        x1: window.innerWidth - 300,
        y1: window.innerHeight - 56,
        offsetX: 300,
        offsetY: 56
      },
      cam: {
        pause: false,
        _tsScale: 1.0,
        _diffScale: 1.0,
        scaler: 1.0,
        _dx: 0,
        _dy: 0,
        _x: 0,
        _y: 0,
        x: 0,
        y: 0
      },
      scaleState: {
        ts: 0,
        ds: 0
      },
      isOpen: false,
      inertia: 1.0
    }
  },
  computed: {
    scaler: {
      get () {
        return this.cam.scaler
      },
      set (v) {
        this.cam.scaler = v
      }
    },
    camX () {
      // var factor = this.scaler
      // factor = 1 / factor
      return this.cam._x
    },
    camY () {
      // var factor = this.scaler
      // factor = 1 / factor
      return this.cam._y
    }
  },
  methods: {
    saveRoot () {
      var dataStr = JSON.stringify(this.root)
      var newBlobURL = URL.createObjectURL(new Blob([dataStr], { type: 'text/json' }))
      var dlAnchorElem = document.createElement('a')
      dlAnchorElem.setAttribute('href', newBlobURL)
      dlAnchorElem.setAttribute('download', 'spaceboard.json')
      dlAnchorElem.click()
    },
    restoreRoot (evt) {
      var reader = new FileReader()
      reader.onload = (evt) => {
        try {
          this.root = JSON.parse(evt.target.result)
        } catch (e) {
          console.log(e)
        }
      }
      if (evt.target.files[0]) {
        reader.readAsText(evt.target.files[0])
      }
    },
    setupPulse () {
      var self = this
      Pulse.setupRealtime({
        $forceUpdate: this.$forceUpdate.bind(this),
        spaceID: this.root.realtime.id,
        get readRoot () {
          return self.root
        }
      })
    },
    onItemPulse ({ arrayName, id, spaceID, item }) {
      Pulse.onItemPulse({ arrayName, id, spaceID, item })
    },
    enableZoom () {
      let setting = `width=device-width, initial-scale=1`
      document.querySelector('meta[name="viewport"]').setAttribute('content', setting)
    },
    disableZoom () {
      let setting = `width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no`
      document.querySelector('meta[name="viewport"]').setAttribute('content', setting)
    },
    onRemoveBox ({ arrayName, id }) {
      var array = this.root[this.using].items[arrayName]
      var item = array.filter((eItem) => {
        return eItem.id === id
      })
      var index = array.indexOf(item[0])
      array.splice(index, 1)
      this.temp.box = item[0]
      this.message.restoreBox = `Want to restore box?`
      setTimeout(() => {
        this.message.restoreBox = false
      }, 5 * 1000)
    },
    onBoxRestore () {
      var restore = this.temp.box
      if (restore) {
        var arrayName = restore.arrayName
        var array = this.root[this.using].items[arrayName]
        array.push(restore)
        this.message.restoreBox = false
        this.temp.box = false
      }
    },
    raycast ({ rect }) {
      var vw = this.view.x1
      var vh = this.view.y1
      var onScreenX = (rect.left - this.view.offsetX)
      var onScreenY = (rect.top - this.view.offsetY)

      var xpos = (onScreenX - vw * 0.5) / this.scaler + vw * 0.5 - this.cam._x
      var ypos = (onScreenY - vh * 0.5) / this.scaler + vh * 0.5 - this.cam._y
      return {
        x: xpos,
        y: ypos,
        z: 0
      }
    },
    createNewOnDrop ({ type, rect }) {
      switch (type) {
        case 'textBox':
          this.root.realtime.items['textBoxes'].push(Data.textBox(({ size }) => {
            return {
              pos: this.raycast({ rect })
            }
          }))
          break
        case 'drawboard':
          this.root.realtime.items['drawboards'].push(
            Data.drawboard({
              pos: this.raycast({ rect })
            })
          )
          break
        case 'commentBox':
          this.root.realtime.items['commentBoxes'].push(
            Data.commentBox({
              pos: this.raycast({ rect })
            })
          )
          break
      }
    },
    handleItemDraggerStart () {
      this.cam.pause = true
    },
    handleItemDraggerEnd () {
      this.cam.pause = false
    },
    handleItemDragger ({ item, evt }) {
      var factor = (window.navigator.userAgent.indexOf('Chrome') !== -1) ? 1.0 : 0.5
      item.pos.x += evt.velocityX * (16.6667) * factor / this.scaler
      item.pos.y += evt.velocityY * (16.6667) * factor / this.scaler

      this.inertia = 0.0
      this.cam._dx = 0.0
      this.cam._dy = 0.0
    },
    onZoomStart (evt) {
      this.cam._tsScale = evt.scale
    },
    onZoom (evt) {
      this.cam._diffScale = evt.scale - this.cam._tsScale
      this.cam._tsScale = evt.scale

      if (this.cam.scaler >= 0.1) {
        this.cam.scaler += this.cam._diffScale
      } else {
        this.cam.scaler = 0.1
      }

      this.cam._dx = 0
      this.cam._dy = 0
    },
    onZoomEnd () {

    },
    onPanCam (evt) {
      if (this.cam.pause) { return }
      var factor = (window.navigator.userAgent.indexOf('Chrome') !== -1) ? 1.0 : 0.5
      this.cam._dx = evt.velocityX * (16.6667) * factor
      this.cam._dy = evt.velocityY * (16.6667) * factor

      this.inertia = 1.1
    },
    initRealtime () {
      this.root.realtime = {
        id: Data.uuid(),
        attention: {
          x: 0,
          y: 0,
          scaler: 1.0
        },
        items: {
          drawboards: [
            Data.drawboard({ pos: { x: 36, y: 270, z: 0 } })
          ],
          textBoxes: [
            Data.textBox(() => { return { pos: { x: 50, y: 50, z: 0 } } })
          ],
          commentBoxes: [
            Data.commentBox({ pos: { x: 585, y: 30, z: 0 } })
          ]
        }
      }
      /* eslint-disable */
      // this.root =
      // {"realtime":{"id":"2be8nv","attention":{"x":0,"y":0,"scaler":1},"items":{"drawboards":[{"id":"0sid7w","pos":{"x":81.66452035554792,"y":350.4130059058064,"z":0},"size":{"width":500,"height":500},"arrayName":"drawboards","component":"Drawboard","data":{"title":"My New DrawBoard","undo":[],"lines":[{"points":[{"x":"-0.87466","y":"0.78965"},{"x":"-0.87466","y":"0.73765"},{"x":"-0.87466","y":"0.66965"},{"x":"-0.87066","y":"0.59765"},{"x":"-0.85866","y":"0.50965"},{"x":"-0.85466","y":"0.47365"},{"x":"-0.83866","y":"0.44965"},{"x":"-0.81866","y":"0.42965"},{"x":"-0.79866","y":"0.42165"},{"x":"-0.77866","y":"0.41765"},{"x":"-0.75466","y":"0.41365"},{"x":"-0.73066","y":"0.41365"},{"x":"-0.69466","y":"0.41365"},{"x":"-0.65466","y":"0.41765"},{"x":"-0.62666","y":"0.41765"},{"x":"-0.59466","y":"0.41765"},{"x":"-0.57866","y":"0.41365"},{"x":"-0.57866","y":"0.41365"}],"strokeStyle":"red"},{"points":[{"x":"-0.58666","y":"0.65765"},{"x":"-0.59466","y":"0.64965"},{"x":"-0.60266","y":"0.64165"},{"x":"-0.61466","y":"0.63365"},{"x":"-0.62666","y":"0.61365"},{"x":"-0.63466","y":"0.59765"},{"x":"-0.63466","y":"0.57765"},{"x":"-0.63466","y":"0.56165"},{"x":"-0.63466","y":"0.54165"},{"x":"-0.63466","y":"0.52565"},{"x":"-0.63066","y":"0.51365"},{"x":"-0.62266","y":"0.50565"},{"x":"-0.61066","y":"0.49765"},{"x":"-0.59466","y":"0.49365"},{"x":"-0.57066","y":"0.49365"},{"x":"-0.54666","y":"0.49365"},{"x":"-0.52666","y":"0.49765"},{"x":"-0.51066","y":"0.50165"},{"x":"-0.49866","y":"0.50965"},{"x":"-0.49066","y":"0.51765"},{"x":"-0.48666","y":"0.52565"},{"x":"-0.48266","y":"0.52965"},{"x":"-0.48266","y":"0.53765"},{"x":"-0.48266","y":"0.54965"},{"x":"-0.48266","y":"0.55365"},{"x":"-0.48666","y":"0.58165"},{"x":"-0.49066","y":"0.60165"},{"x":"-0.50266","y":"0.62165"},{"x":"-0.51466","y":"0.63365"},{"x":"-0.52666","y":"0.64165"},{"x":"-0.53866","y":"0.64965"},{"x":"-0.55066","y":"0.65365"},{"x":"-0.55866","y":"0.65365"},{"x":"-0.56666","y":"0.65365"},{"x":"-0.57066","y":"0.65365"},{"x":"-0.57466","y":"0.65365"},{"x":"-0.57466","y":"0.64965"},{"x":"-0.57466","y":"0.64965"}],"strokeStyle":"green"},{"points":[{"x":"-0.40266","y":"0.71765"},{"x":"-0.39866","y":"0.64565"},{"x":"-0.39466","y":"0.54965"},{"x":"-0.37866","y":"0.45765"},{"x":"-0.37066","y":"0.38965"},{"x":"-0.36266","y":"0.34165"},{"x":"-0.35466","y":"0.30965"},{"x":"-0.35466","y":"0.30565"},{"x":"-0.35066","y":"0.29765"},{"x":"-0.35066","y":"0.29765"}],"strokeStyle":"blue"},{"points":[{"x":"-0.24266","y":"0.60965"},{"x":"-0.28666","y":"0.57765"},{"x":"-0.33466","y":"0.53765"},{"x":"-0.37866","y":"0.50965"},{"x":"-0.40266","y":"0.48965"},{"x":"-0.42266","y":"0.47765"},{"x":"-0.42666","y":"0.46965"},{"x":"-0.43066","y":"0.46965"},{"x":"-0.43066","y":"0.46565"},{"x":"-0.42666","y":"0.46565"},{"x":"-0.41066","y":"0.46165"},{"x":"-0.39066","y":"0.45365"},{"x":"-0.36666","y":"0.43365"},{"x":"-0.33866","y":"0.41365"},{"x":"-0.30666","y":"0.39765"},{"x":"-0.28666","y":"0.38565"},{"x":"-0.27066","y":"0.37765"},{"x":"-0.25866","y":"0.37365"},{"x":"-0.25466","y":"0.37365"},{"x":"-0.23466","y":"0.36565"},{"x":"-0.23466","y":"0.36565"}],"strokeStyle":"blue"},{"points":[{"x":"-0.58266","y":"0.25765"},{"x":"-0.59866","y":"0.25765"},{"x":"-0.60666","y":"0.25365"},{"x":"-0.61866","y":"0.24565"},{"x":"-0.63066","y":"0.23365"},{"x":"-0.64666","y":"0.21765"},{"x":"-0.65866","y":"0.19765"},{"x":"-0.66266","y":"0.16565"},{"x":"-0.67466","y":"0.10565"},{"x":"-0.67466","y":"0.00165"},{"x":"-0.67466","y":"-0.04235"},{"x":"-0.67466","y":"-0.09035"},{"x":"-0.67466","y":"-0.10635"},{"x":"-0.67466","y":"-0.11435"},{"x":"-0.67466","y":"-0.11835"},{"x":"-0.67466","y":"-0.11835"}],"strokeStyle":"purple"},{"points":[{"x":"-0.69466","y":"0.05365"},{"x":"-0.63866","y":"0.06565"},{"x":"-0.57066","y":"0.07365"},{"x":"-0.53866","y":"0.07365"},{"x":"-0.52266","y":"0.07365"},{"x":"-0.51466","y":"0.07365"},{"x":"-0.51066","y":"0.07365"},{"x":"-0.51066","y":"0.07365"}],"strokeStyle":"purple"},{"points":[{"x":"-0.39866","y":"0.09365"},{"x":"-0.40666","y":"0.03365"},{"x":"-0.40666","y":"-0.02635"},{"x":"-0.40666","y":"-0.08635"},{"x":"-0.40666","y":"-0.12635"},{"x":"-0.40266","y":"-0.15835"},{"x":"-0.39466","y":"-0.17435"},{"x":"-0.39066","y":"-0.18235"},{"x":"-0.38666","y":"-0.18635"},{"x":"-0.38266","y":"-0.18635"},{"x":"-0.35466","y":"-0.17835"},{"x":"-0.30666","y":"-0.15035"},{"x":"-0.26266","y":"-0.10635"},{"x":"-0.22666","y":"-0.05835"},{"x":"-0.20266","y":"-0.03035"},{"x":"-0.18666","y":"0.00165"},{"x":"-0.17866","y":"0.02565"},{"x":"-0.17866","y":"0.04965"},{"x":"-0.17866","y":"0.06565"},{"x":"-0.17866","y":"0.08165"},{"x":"-0.18266","y":"0.08965"},{"x":"-0.18666","y":"0.09365"},{"x":"-0.19066","y":"0.09765"},{"x":"-0.19466","y":"0.09765"},{"x":"-0.19466","y":"0.09365"},{"x":"-0.19466","y":"0.08565"},{"x":"-0.19066","y":"0.07365"},{"x":"-0.17866","y":"0.01765"},{"x":"-0.17066","y":"-0.06635"},{"x":"-0.15466","y":"-0.15035"},{"x":"-0.13866","y":"-0.20635"},{"x":"-0.12666","y":"-0.25035"},{"x":"-0.11866","y":"-0.27035"},{"x":"-0.11866","y":"-0.27435"},{"x":"-0.11066","y":"-0.27435"},{"x":"-0.10266","y":"-0.27435"},{"x":"-0.10266","y":"-0.27435"}],"strokeStyle":"black"},{"points":[{"x":"0.04534","y":"0.04565"},{"x":"0.04534","y":"-0.07035"},{"x":"0.04934","y":"-0.11435"},{"x":"0.04934","y":"-0.15835"},{"x":"0.05334","y":"-0.17835"},{"x":"0.05334","y":"-0.19035"},{"x":"0.05334","y":"-0.19435"},{"x":"0.05734","y":"-0.19435"},{"x":"0.05734","y":"-0.19835"},{"x":"0.05734","y":"-0.19435"},{"x":"0.05334","y":"-0.19435"},{"x":"0.05334","y":"-0.19035"},{"x":"0.05334","y":"-0.17835"},{"x":"0.06134","y":"-0.15035"},{"x":"0.07334","y":"-0.09035"},{"x":"0.09334","y":"-0.02235"},{"x":"0.12934","y":"0.06565"},{"x":"0.14534","y":"0.10165"},{"x":"0.15734","y":"0.13765"},{"x":"0.16534","y":"0.15365"},{"x":"0.16934","y":"0.16165"},{"x":"0.17334","y":"0.16165"},{"x":"0.17734","y":"0.16165"},{"x":"0.18134","y":"0.16165"},{"x":"0.18534","y":"0.15765"},{"x":"0.19334","y":"0.14965"},{"x":"0.20534","y":"0.13765"},{"x":"0.21734","y":"0.12565"},{"x":"0.22534","y":"0.11365"},{"x":"0.23734","y":"0.09365"},{"x":"0.24934","y":"0.06965"},{"x":"0.25734","y":"0.02965"},{"x":"0.27334","y":"-0.01435"},{"x":"0.28934","y":"-0.04635"},{"x":"0.30134","y":"-0.07835"},{"x":"0.30934","y":"-0.10235"},{"x":"0.32534","y":"-0.11835"},{"x":"0.34534","y":"-0.13035"},{"x":"0.39734","y":"-0.14635"},{"x":"0.42934","y":"-0.15035"},{"x":"0.43334","y":"-0.15035"},{"x":"0.43734","y":"-0.14635"},{"x":"0.43734","y":"-0.14235"},{"x":"0.43734","y":"-0.12235"},{"x":"0.43734","y":"-0.12235"}],"strokeStyle":"gold"}]}}],"textBoxes":[{"id":"750wgn","pos":{"x":81.73504797695486,"y":104.40865695993296,"z":0},"size":{"width":300,"height":200},"arrayName":"textBoxes","component":"TextBox","data":{"text":"New Text"}},{"id":"v2me66","pos":{"x":427.3393327803211,"y":59.81976390600458,"z":0},"size":{"width":300,"height":200},"arrayName":"textBoxes","component":"TextBox","data":{"text":"New Text"}},{"id":"ckygdc","pos":{"x":617.1763589536438,"y":296.1026460142827,"z":0},"size":{"width":300,"height":200},"arrayName":"textBoxes","component":"TextBox","data":{"text":"New Text"}}]}},"timetravel":{},"timemachine":[]}
      /* eslint-enable */
      this.setupPulse()
      this.zoomIntro()
    },
    zoomIntro () {
      // zoom in //
      let tempScaler = this.root[this.using].attention.scaler
      this.root[this.using].attention.scaler = 0.1
      this.viewAttention({ instant: true })
      this.root[this.using].attention.scaler = tempScaler
      this.viewAttention({ instant: false })
    },
    markCam () {
      this.root[this.using].attention.x = this.cam._x
      this.root[this.using].attention.y = this.cam._y
      this.root[this.using].attention.scaler = this.cam.scaler

      this.message.markCam = `Camera Successfully Marked`
      setTimeout(() => {
        this.message.markCam = false
      }, 1500)
    },
    restoreCam () {
      this.setAttention(this.root[this.using].attention.x, this.root[this.using].attention.y, this.root[this.using].attention.scaler)
    },
    setAttention (x, y, scaler) {
      this.root[this.using].attention.x = x
      this.root[this.using].attention.y = y
      this.root[this.using].attention.scaler = scaler
      this.viewAttention({})
    },
    viewAttention ({ instant }) {
      // remove inertia.
      this.inertia = 0.0
      this.cam._dx = 0.0
      this.cam._dy = 0.0

      if (instant) {
        this.cam._x = this.root[this.using].attention.x
        this.cam._y = this.root[this.using].attention.y
        this.cam.scaler = this.root[this.using].attention.scaler
      } else {
        new TWEEN.Tween(this.cam).to({
          _x: this.root[this.using].attention.x,
          _y: this.root[this.using].attention.y,
          scaler: this.root[this.using].attention.scaler
        }, 700).easing(TWEEN.Easing.Quadratic.Out).start()
      }
    }
  },
  mounted () {
    //
    this.disableZoom()

    setTimeout(() => {
      this.initRealtime()
    }, 500)
    var self = this

    function rAF () {
      if (self.inertia > 0.0001) {
        self.cam._x += self.cam._dx * self.inertia
        self.cam._y += self.cam._dy * self.inertia
      }
      self.inertia *= 0.97
      self.rAFID = window.requestAnimationFrame(rAF)
      TWEEN.update()
    }
    this.rAFID = window.requestAnimationFrame(rAF)

    this.$refs['canvas-wrapper'].addEventListener('wheel', (evt) => {
      if (evt.altKey) {
      } else if (this.hover) {

      } else {
        evt.preventDefault()
        this.cam._x -= (evt.deltaX / this.scaler)
        this.cam._y -= (evt.deltaY / this.scaler)
      }
    }, false)

    window.addEventListener('resize', () => {
      this.view = {
        x0: 0,
        y0: 0,
        x1: window.innerWidth - 300,
        y1: window.innerHeight - 56,
        offsetX: 300,
        offsetY: 56
      }
    })
  },
  beforeDestroy () {
    this.enableZoom()
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
  /* background-color: #bababa; */
  border-right: grey solid 1px;
}
.btns{
  flex-wrap: wrap;
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
}
.canvas-wrapper{
  overflow: hidden;
  transform-style: preserve-3d;
  position: relative;
  width: 100%;
  height: 100%;
}

.canvas-toucher {
  position: absolute;
  top: 0px;
  left: 0px;
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
  /* background: rgba(0,0,255,0.2); */
}
.drawer{
  position: absolute;
  top: 0px;
  left: 400px;
  width: 100%;
  height: calc(100% - 56px * 0.0);
  transform: translateX(100%);
  transition: transform 1s;
  transition-timing-function: cubic-bezier(0.075, 0.82, 0.165, 1);
  background-color: rgba(255,255,255,0.2);
}
.drawer.is-open{
  transform: translateX(0);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0
}

</style>
