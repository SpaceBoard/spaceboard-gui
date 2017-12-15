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
            :pannerEnd="() => { handleItemDraggerEnd(); onItemPulse({ arrayName: box.arrayName, id: box.id, spaceID: root.realtime.id, item: box }) }"
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
              :user="user"
            ></component>
          </Positioner>
        </div>
      </div>


    </div>
  </div>
  <div class="drawer" :class="{ 'is-open': isOpen }">

  </div>
  <div class="toolbar">
    <div class="btns">
      <SourceButton @drop="createNewOnDrop" fileType="drawboard">Picture + Draw </SourceButton>
      <SourceButton @drop="createNewOnDrop" fileType="commentBox">Comment </SourceButton>
      <SourceButton @drop="createNewOnDrop" fileType="textBox">Text</SourceButton>
      <SourceButton @drop="createNewOnDrop" fileType="file">File</SourceButton>
      <!-- <div class="btn btn-movable">Upload File <img class="dragger" src="./img/icons/mover.svg" /></div>
      <div class="btn btn-movable">Picture + Annotation <img class="dragger" src="./img/icons/mover.svg" /></div>
      <div class="btn btn-movable">Realtime Drawboard <img class="dragger" src="./img/icons/mover.svg" /></div>
      <div class="btn btn-movable">Comment Box <img class="dragger" src="./img/icons/mover.svg" /></div>
      <div class="btn btn-movable">Text Box <img class="dragger" src="./img/icons/mover.svg" /></div> -->
    </div>

    <div class="toolbar-footer">
       <div class="notifier">
        <transition name="fade">
          <h3 v-if="message.markCam">{{ message.markCam }}</h3>
        </transition>
        <transition name="fade">
          <h3 v-if="message.restoreBox" @click="onBoxRestore()" >{{ message.restoreBox }}<button @click="onBoxRestore()" >Restore</button></h3>
        </transition>
      </div>
      <input class="scale-ranger" type="range" step="0.000001" min="0.1" max="5" v-model="scaler" />
      <div class="tool-bar-icon-set">
        <img src="./img/icon/mark-cam.svg" @click="() => { markCam(); }" />
        <img src="./img/icon/reset-cam.svg" @click="() => { restoreCam(); }" />
        <img src="./img/icon/download.svg" @click="() => { saveRoot(); }" />
      </div>
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
      user: { uid: Data.uuid(), colorA: (Math.random() * 0xFFFFFF << 0).toString(16) + '', colorB: (Math.random() * 0xFFFFFF << 0).toString(16) + '', name: 'dai ming' },
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
        y1: window.innerHeight - 56 * 0.0,
        offsetX: 300,
        offsetY: 56 * 0.0
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
      Pulse.setupRealtimeUpdaters({
        $forceUpdate: this.$forceUpdate.bind(this),
        spaceID: this.root.realtime.id,
        set writeRoot (v) {
          self.root = v
        },
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

      Pulse.onItemDeletion({ spaceID: this.root.realtime.id, item, arrayName, id })

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

        Pulse.onItemCreation({ spaceID: this.root.realtime.id, item: restore, arrayName, id: restore.id })

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
      var newItem = false
      var newPos = this.raycast({ rect })
      if (newPos.x < 0) {
        // did not drag to the canvas area
        return
      }
      switch (type) {
        case 'textBox':
          newItem = Data.textBox(({ size }) => {
            return {
              pos: newPos
            }
          })
          this.root.realtime.items['textBoxes'].push(
            newItem
          )
          break
        case 'drawboard':
          newItem = Data.drawboard({
            pos: newPos
          })
          this.root.realtime.items['drawboards'].push(
            newItem
          )
          break
        case 'commentBox':
          newItem = Data.commentBox({
            pos: newPos
          })
          this.root.realtime.items['commentBoxes'].push(
            newItem
          )
          break
      }
      if (newItem) {
        Pulse.onItemCreation({ item: newItem, spaceID: this.root.realtime.id, arrayName: newItem.arrayName, id: newItem.id })
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
            // Data.drawboard({ pos: { x: 36, y: 270, z: 0 } })
          ],
          textBoxes: [
            // Data.textBox(() => { return { pos: { x: 50, y: 50, z: 0 } } })
          ],
          commentBoxes: [
            // Data.commentBox({
            //   pos: { x: 585, y: 30, z: 0 },
            //   sampleComments: [
            //     Data.makeComment({ name: 'siu ming', uid: 'user1', text: 'How are you?' }),
            //     Data.makeComment({ name: 'siu ming', uid: 'user1', text: 'See you around~' })
            //   ]
            // })
          ]
        }
      }

      /* eslint-disable */
      this.root =
      {"realtime":{"id":"pwnxku","attention":{"x":0,"y":0,"scaler":1},"items":{"drawboards":[{"id":"wzff9r","pos":{"x":63.070281982421875,"y":317.76702880859375,"z":0},"size":{"width":500,"height":500},"arrayName":"drawboards","component":"Drawboard","data":{"title":"My New DrawBoard","undo":[],"lines":[{"points":[{"x":"-0.81628","y":"0.31452"},{"x":"-0.80828","y":"0.32785"},{"x":"-0.80428","y":"0.34563"},{"x":"-0.79228","y":"0.36341"},{"x":"-0.76828","y":"0.39008"},{"x":"-0.74828","y":"0.40341"},{"x":"-0.69628","y":"0.43008"},{"x":"-0.66028","y":"0.43896"},{"x":"-0.61628","y":"0.44341"},{"x":"-0.56028","y":"0.44785"},{"x":"-0.50828","y":"0.44341"},{"x":"-0.47228","y":"0.43008"},{"x":"-0.42828","y":"0.41230"},{"x":"-0.40028","y":"0.38563"},{"x":"-0.37228","y":"0.35896"},{"x":"-0.34428","y":"0.33230"},{"x":"-0.32828","y":"0.30563"},{"x":"-0.31228","y":"0.28341"},{"x":"-0.30428","y":"0.27008"},{"x":"-0.30428","y":"0.25674"},{"x":"-0.30428","y":"0.24341"},{"x":"-0.31228","y":"0.23452"},{"x":"-0.33228","y":"0.22563"},{"x":"-0.36428","y":"0.21230"},{"x":"-0.40828","y":"0.19452"},{"x":"-0.44828","y":"0.18563"},{"x":"-0.47628","y":"0.17674"},{"x":"-0.50028","y":"0.17230"},{"x":"-0.52028","y":"0.16785"},{"x":"-0.52428","y":"0.16785"},{"x":"-0.52428","y":"0.17230"},{"x":"-0.52428","y":"0.18119"},{"x":"-0.52428","y":"0.19008"},{"x":"-0.52428","y":"0.19896"},{"x":"-0.51628","y":"0.20785"},{"x":"-0.50828","y":"0.21230"},{"x":"-0.48828","y":"0.22119"},{"x":"-0.44828","y":"0.23452"},{"x":"-0.39628","y":"0.24785"},{"x":"-0.32828","y":"0.25674"},{"x":"-0.28028","y":"0.26119"},{"x":"-0.22828","y":"0.26119"},{"x":"-0.19228","y":"0.26119"},{"x":"-0.16028","y":"0.26119"},{"x":"-0.14028","y":"0.25674"},{"x":"-0.12028","y":"0.24785"},{"x":"-0.09628","y":"0.23896"},{"x":"-0.08428","y":"0.23008"},{"x":"-0.06828","y":"0.20341"},{"x":"-0.05628","y":"0.19008"},{"x":"-0.04828","y":"0.17230"},{"x":"-0.04028","y":"0.15008"},{"x":"-0.04028","y":"0.14119"},{"x":"-0.04028","y":"0.12785"},{"x":"-0.04028","y":"0.11452"},{"x":"-0.04428","y":"0.11008"},{"x":"-0.05628","y":"0.10119"},{"x":"-0.07628","y":"0.09230"},{"x":"-0.09628","y":"0.07896"},{"x":"-0.12828","y":"0.06119"},{"x":"-0.16428","y":"0.05230"},{"x":"-0.20828","y":"0.04341"},{"x":"-0.23628","y":"0.03896"},{"x":"-0.26028","y":"0.03896"},{"x":"-0.27228","y":"0.04341"},{"x":"-0.28028","y":"0.05230"},{"x":"-0.28428","y":"0.06563"},{"x":"-0.28428","y":"0.07896"},{"x":"-0.27228","y":"0.10563"},{"x":"-0.23228","y":"0.16785"},{"x":"-0.18028","y":"0.22563"},{"x":"-0.10028","y":"0.29674"},{"x":"-0.08028","y":"0.31008"},{"x":"-0.01228","y":"0.34119"},{"x":"0.04772","y":"0.35008"},{"x":"0.09172","y":"0.35896"},{"x":"0.13572","y":"0.35896"},{"x":"0.16772","y":"0.35008"},{"x":"0.20372","y":"0.33674"},{"x":"0.24372","y":"0.31008"},{"x":"0.27972","y":"0.27008"},{"x":"0.31572","y":"0.21674"},{"x":"0.34372","y":"0.15452"},{"x":"0.36772","y":"0.10119"},{"x":"0.38372","y":"0.03452"},{"x":"0.39572","y":"-0.00992"},{"x":"0.39972","y":"-0.05437"},{"x":"0.40772","y":"-0.07659"},{"x":"0.40772","y":"-0.09437"},{"x":"0.40772","y":"-0.10326"},{"x":"0.40772","y":"-0.10770"},{"x":"0.40772","y":"-0.11215"},{"x":"0.41172","y":"-0.12104"},{"x":"0.41172","y":"-0.12104"}],"strokeStyle":"green"}]}}],"textBoxes":[{"id":"43noxj","pos":{"x":50,"y":50,"z":0},"size":{"width":300,"height":200},"arrayName":"textBoxes","component":"TextBox","data":{"text":"New Text"}}],"commentBoxes":[{"id":"1benr4","pos":{"x":601.6386939607628,"y":61.97921422301565,"z":0},"size":{"width":300,"height":600},"arrayName":"commentBoxes","component":"CommentBox","data":{"title":"My New CommentBox","comments":[{"uid":"3b00ed","name":"dai ming","date":"2017-12-15T07:36:09.220Z","text":"Hi"}]},"sampleComments":[]}]}},"timetravel":{},"timemachine":[]}
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

      this.message.markCam = `Sync: All Watch My Screen`
      setTimeout(() => {
        this.message.markCam = false
      }, 1500)
    },
    restoreCam () {
      this.setAttention(this.root[this.using].attention.x, this.root[this.using].attention.y, this.root[this.using].attention.scaler)
      this.viewAttention({ instant: false })
    },
    setAttention (x, y, scaler) {
      this.root[this.using].attention.x = x
      this.root[this.using].attention.y = y
      this.root[this.using].attention.scaler = scaler
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
  margin-bottom: 30px;
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
  height: calc(100% - 56px * 0.0);
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
.toolbar-footer{
  position: absolute;
  bottom: 0px;
  left: 0px;
  padding-bottom: 25px;
  display: flex;
  justify-content: space-around;
  flex-direction: column;
}
.tool-bar-icon-set{
  display: flex;
  justify-content: space-around;
  align-items: center;
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

.notifier{
  text-align: center;
}

</style>
