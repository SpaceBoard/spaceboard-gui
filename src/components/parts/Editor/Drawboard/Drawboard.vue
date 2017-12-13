<template>
  <canvas class="box" ref="canvava" v-touch:panstart="panstart" v-touch:pan="panning" v-touch:panend="panend" :width="size.width" :height="size.height" :style="{
    width: size.width + 'px',
    height: size.height + 'px'
  }">
  </canvas>
</template>

<script>
var simplify = require('simplify-path')
function drawLines ({ ctx, canvas, lines }) {
  // ctx.font = '20pt Arial'
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'rgba(255,255,255,0.0)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.strokeStyle = 'grey'
  ctx.lineWidth = '1'

  for (var i = 0; i < lines.length; i++) {
    let currentLinePoints = lines[i].points
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
    cam: {},
    box: {},
    view: {}
  },
  created () {
  },
  data () {
    return {
      dirty: false,
      rAFID: 0,
      rendering: {},
      size: this.$options.info.size,
      lines: this.box.data.lines
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

    panstart (evt) {
      this.lines.push({
        points: [],
        color: 'red'
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

      this.lines[this.lines.length - 1].points.push({
        x: ((evt.center.x - this.$parent.readXPos - this.view.offsetX) / this.size.width) * 2.0 - 1.0,
        y: -((evt.center.y - this.$parent.readYPos - this.view.offsetY) / this.size.height) * 2.0 + 1.0
      })

      this.dirty = true
    },
    panend (evt) {
      var old = this.lines[this.lines.length - 1].points.map(pt => [pt.x, pt.y])
      var newPt = simplify(old, 0.00025)
      this.lines[this.lines.length - 1].points = newPt.map(pt => { return { x: pt[0], y: pt[1] } })
      console.log(this.lines)

      this.dirty = true
      this.$emit('draw', {
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
  /* background-color: white; */
}
</style>
