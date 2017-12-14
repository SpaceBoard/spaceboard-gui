<template>
  <div class="box">
    <canvas class="" ref="canvava" v-touch:panstart="panstart" v-touch:pan="panning" v-touch:panend="panend" :width="size.width" :height="size.height" :style="{
      width: size.width + 'px',
      height: size.height + 'px'
    }">
    </canvas>
    <input class="title" v-model="box.data.title" @input="sayUpdate" />
    <div class="undo" v-touch:tap="undo" v-show="lines.length > 0">
      <img src="./img/undo.svg" draggable="false" />
    </div>
    <div class="redo" v-touch:tap="redo" v-show="undoData.length > 0">
      <img src="./img/redo.svg" draggable="false" />
    </div>
    <div class="color-btn" v-touch:tap="showColor">
      <img src="./img/palette.svg" draggable="false" />
    </div>
    <div class="palette" v-if="showPalete">
      <div class="colorbox red" @click="setCurrentColor('red')"></div>
      <div class="colorbox green" @click="setCurrentColor('green')"></div>
      <div class="colorbox blue" @click="setCurrentColor('blue')"></div>
      <div class="colorbox black"  @click="setCurrentColor('black')"></div>
      <div class="colorbox purple"  @click="setCurrentColor('purple')"></div>
      <div class="colorbox gold"  @click="setCurrentColor('gold')"></div>
    </div>
  </div>
</template>

<script>
var simplify = require('simplify-path')
function drawLines ({ ctx, canvas, lines }) {
  // ctx.font = '20pt Arial'
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'rgba(255,255,255,0.0)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // ctx.strokeStyle = 'grey'
  // ctx.lineWidth = '1'

  for (var i = 0; i < lines.length; i++) {
    let currentLinePoints = lines[i].points
    ctx.strokeStyle = lines[i].strokeStyle || 'grey'
    ctx.lineWidth = lines[i].lineWidth || '1.0'

    if (currentLinePoints && currentLinePoints.length) {
      for (var j = 0; j < currentLinePoints.length; j++) {
        let curPt = currentLinePoints[j]
        if (curPt && curPt.x && curPt.y) {
          if (j === 0) {
            ctx.beginPath()
            ctx.moveTo(canvas.width * 0.5 + canvas.width * 0.5 * curPt.x, canvas.height * 0.5 + canvas.height * -0.5 * curPt.y)
          } else if (j > 0 && j !== currentLinePoints.length - 1) {
            ctx.lineTo(canvas.width * 0.5 + canvas.width * 0.5 * curPt.x, canvas.height * 0.5 + canvas.height * -0.5 * curPt.y)
          } else if (j === currentLinePoints.length - 1) {
            ctx.stroke()
          }
        }
      }
    }
  }
}

export default {
  props: {
    offsetY: { default: 0 },
    cam: {},
    box: {},
    view: {}
  },
  created () {
  },
  data () {
    var self = this
    return {
      currentColor: 'green',
      showPalete: false,
      dirty: false,
      rAFID: 0,
      rendering: {},
      size: this.$options.info.size,
      get lines () {
        return self.box.data.lines
      }
    }
  },
  computed: {
    undoData () {
      return this.box.data.undo
    }
  },
  mounted () {
    var self = this
    self.rendering.ctx = self.$refs['canvava'].getContext('2d')
    self.$refs['canvava'].width = this.size.width
    self.$refs['canvava'].height = this.size.height
    function rAF () {
      self.rAFID = window.requestAnimationFrame(rAF)
      self.renderCanvas()
    }
    self.rAFID = window.requestAnimationFrame(rAF)
    this.dirty = true
  },
  beforeDestroy () {
    window.cancelAnimationFrame(this.rAFID)
  },
  watch: {
    box () {
      this.dirty = true
    },
    lines () {
      this.dirty = true
    }
  },
  methods: {
    renderCanvas () {
      if (this.dirty) {
        var ctx = this.rendering.ctx
        var canvas = this.$refs['canvava']
        var lines = this.lines
        drawLines({ ctx, canvas, lines })
        this.dirty = false
      }
    },

    setCurrentColor (color) {
      this.currentColor = color
      this.showPalete = false
    },
    showColor () {
      this.showPalete = !this.showPalete
    },

    undo () {
      var undid = this.lines.pop()
      if (undid) {
        this.undoData.push(undid)
        this.dirty = true
        this.$emit('pulse-update', {
          box: this.box
        })
      }
    },

    redo () {
      var dooo = this.undoData.pop()
      if (dooo) {
        this.lines.push(dooo)
        this.dirty = true
        this.$emit('pulse-update', {
          box: this.box
        })
      }
    },

    panstart (evt) {
      this.lines.push({
        points: [],
        lineWidth: this.currentLineWidth,
        strokeStyle: this.currentColor
      })
    },
    panning (evt) {
      // var evt = oEvt.srcEvent
      // var px = evt.pageX - 300
      // var py = evt.pageY - 56

      // (this.xcam + this.xpos - this.view.x1 * 0.5) * this.scaler + this.view.x1 * 0.5

      // ui2.pageX = evt.pageX
      // ui2.pageY = evt.pageY
      // ui2.ccX = ((ui2.pageX - ui2.rect.left) / ui2.api.width) * 2 - 1
      // ui2.ccY = -((ui2.pageY - ui2.rect.top) / ui2.api.height) * 2 + 1

      // iDear

      let pt = {
        x: ((evt.center.x - this.$parent.readXPos - this.view.offsetX) / this.cam.scaler / this.size.width) * 2.0 - 1.0,
        y: -((evt.center.y - this.$parent.readYPos - this.view.offsetY - this.offsetY) / this.cam.scaler / this.size.height) * 2.0 + 1.0
      }
      pt.x = pt.x.toFixed(5)
      pt.y = pt.y.toFixed(5)
      this.lines[this.lines.length - 1].points.push(pt)

      this.dirty = true
    },
    panend (evt) {
      var current = this.lines[this.lines.length - 1]
      var old = current.points.map(pt => [pt.x, pt.y])
      var newPt = simplify.radialDistance(old, this.cam.scaler * 0.00333)
      current.points = newPt.map(pt => { return { x: pt[0], y: pt[1] } })
      // console.log(this.lines)

      this.dirty = true
      this.$emit('pulse-update', {
        box: this.box
      })
    },
    sayUpdate () {
      this.$emit('pulse-update', {
        box: this.box
      })
    }
  },
  info: {
    size: { width: 500, height: 500 }
  }
}
</script>

<style>
.box{
  width: 100%;
  height: 100%;
  position: relative;
  /* background-color: white; */
}

.title{
  position: absolute;
  -webkit-appearance: none;
  border: none;
  outline: none;
  background: transparent;

  top: -42px;
  left: 125px;

  text-decoration: underline;

  transform: scale(1.5);
  width: 250px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.redo,
.undo{
  position: absolute;
  top: -43px;
  left: 50px;
  transform: scale(1.5);
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.redo > img,
.undo > img {
  max-width: 20px;
  max-height: 20px;
}


.color-btn{
  position: absolute;
  top: -43px;
  right: 50px;
  transform: scale(1.5);
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.palette{
  position: absolute;
  top: 50px;
  right: 50px;
  transform: scale(1.5);
  width: 100px;
  height: 100px;
}

.color-btn img{
  max-width: 20px;
  max-height: 20px;
}

.redo {
  left: 100px;
}

.colorbox{
  display: inline-block;
  width: 30px;
  height: 30px;
}
.red{
  background-color: red;
}
.green{
  background-color: green;
}
.blue{
  background-color: blue;
}
.black{
  background-color: black;
}
.purple{
  background-color: purple;
}
.gold{
  background-color: gold;
}

</style>
