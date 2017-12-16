<template>
  <div class="btn-wrap">
    <div class="btn pos-abs">
      <div class="text">
        {{ $slots.default[0].text }}
      </div>
      <img class="dragger pulse" :class="{ ['delay-' + index]: true }" src="./img/mover.svg" />
    </div>
    <div class="btn pos-abs" :style="{
      transform: readTransform
    }">
      <div class="text">
        {{ $slots.default[0].text }}
      </div>
      <img class="dragger pulse" :class="{ ['delay-' + index]: true }" src="./img/mover.svg" ref="dynamic-box" v-touch:pan="(evt) => { panning(evt) }" v-touch:panend="(evt) => { panend(evt, fileType) }" />
    </div>
  </div>
</template>

<script>
import TWEEN from '@tweenjs/tween.js'

export default {
  props: {
    index: { default: 0 },
    fileType: {}
  },
  data () {
    return {
      pos: { x: 0, y: 0 }
    }
  },
  computed: {
    readTransform () {
      return `translate3d(${this.pos.x}px,${this.pos.y}px,100.0px)`
    }
  },
  methods: {
    panning (evt) {
      var factor = (window.navigator.userAgent.indexOf('Chrome') !== -1) ? 1.0 : 0.5
      this.pos.x += evt.velocityX * (16.6667) * factor
      this.pos.y += evt.velocityY * (16.6667) * factor
    },
    panend (evt, fileType) {
      this.$emit('drop', { type: fileType, rect: this.$refs['dynamic-box'].getBoundingClientRect() })
      new TWEEN.Tween(this.pos).to({
        x: 0,
        y: 0
      }, 300).easing(TWEEN.Easing.Quadratic.Out).start()
    }
  }
}
</script>

<style scoped>
.btn-wrap{
  width: calc(100% - 40px);
  margin: 15px 0px 0px 0px;

  height: 56px;
  position: relative;
}
.text{
  padding: 0px 0px 0px 15px;
}
.btn{
  width: calc(100%);
  height: 56px;

  line-height: 56px;
  border: grey solid 1px;
  color: black;
  font-size: 20px;
  text-align: left;
}
.pos-abs{
  position: absolute;
  top: 0px;
  left: 0px;
}

.dragger {
  cursor: move;
  position: absolute;
  right: 10px;
  top: 10px;
}


@keyframes tada {
  from {
    transform: scale3d(1, 1, 1);
  }

  10%, 20% {
    transform: scale3d(.9, .9, .9) rotate3d(0, 0, 1, -3deg);
  }

  30%, 50%, 70%, 90% {
    transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg);
  }

  40%, 60%, 80% {
    transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg);
  }

  to {
    transform: scale3d(1, 1, 1);
  }
}


@keyframes pulse {
  from {
    transform: scale3d(1, 1, 1);
  }

  50% {
    transform: scale3d(1.05, 1.05, 1.05);
  }

  to {
    transform: scale3d(1, 1, 1);
  }
}

.pulse {
  animation: pulse 1s cubic-bezier(0.075, 0.82, 0.165, 1) 0s infinite normal both;
}

.tada {
  animation: tada 1s cubic-bezier(0.075, 0.82, 0.165, 1) 0s infinite normal both;
}
.delay-1{
  animation-delay: 0.1s;
}
.delay-2{
  animation-delay: 0.2s;
}
.delay-3{
  animation-delay: 0.3s;
}
.delay-4{
  animation-delay: 0.4s;
}

</style>
