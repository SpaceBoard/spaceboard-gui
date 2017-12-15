<template>
<div class="box">
  <!-- <div class="title" contenteditable="yes" @keyup="sayUpdate">{{ box.data.title }}</div> -->
  <div class="converstaion do-default-action" ref="convo" @mouseout="$emit('hover', false)" @mouseover="$emit('hover', true)" d-touch:pan="onPan">
    <div class="bubble-wrap"
    :key="iBubble"
    v-for="(bubble, iBubble) in box.data.comments"
    :class="{
      'wrap-others': user.uid !== bubble.uid,
      'wrap-me': user.uid === bubble.uid
    }">
      <div class="bubble"
      :class="{
        'box-others': user.uid !== bubble.uid,
        'box-me': user.uid === bubble.uid
      }"
      :style="{
        backgroundImage: `linear-gradient(45deg, #${bubble.colorA},#${bubble.colorB})`
      }"
      >
        {{ bubble.text }}
      </div>
    </div>
    <div class="bubble-taller">
    </div>
  </div>

  <!-- <pre>{{ box.data.comments }}</pre> -->
  <div class="comment-input">
    <input class="text-input" v-model="newComment" @keydown.enter="addComment" ref="texter" />
    <button class="sender" @click="addComment">Say</button>
  </div>
</div>
</template>

<script>
import * as Data from '../Data/DataStructure.js'
export default {
  props: {
    box: {},
    cam: {},
    user: {
      default () {
        return {
          name: 'lok lok',
          uid: 'user2'
        }
      }
    }
  },
  data () {
    return {
      newComment: ''
    }
  },
  mounted () {
    // this.$refs.convo.addEventListener('wheel', (evt) => {
    //   evt.preventDefault()
    // }, false)
  },
  watch: {
    comments () {
      var div = this.$refs['convo']
      div.scrollTop = div.scrollHeight
    }
  },
  computed: {
    comments () {
      return this.box.data.comments
    }
  },
  methods: {
    onPan (evt) {
      var div = this.$refs['convo']
      div.scrollAmount = div.scrollAmount || div.scrollTop
      var factor = (window.navigator.userAgent.indexOf('Chrome') !== -1) ? 1.0 : 0.5
      // item.pos.x += evt.velocityX * (16.6667) * factor / this.scaler
      div.scrollAmount -= evt.velocityY * (16.6667) * factor / this.cam.scaler
      div.scrollTop = div.scrollAmount
    },
    addComment () {
      if (!this.newComment) {
        return
      }
      this.box.data.comments.push(
        Data.makeComment({
          uid: this.user.uid,
          colorA: this.user.colorA,
          colorB: this.user.colorB,
          name: this.user.name,
          text: this.newComment
        })
      )
      this.newComment = ''
      this.$refs.texter.focus()
      this.$emit('pulse-update')
    },
    sayUpdate () {

    }
  },
  info: {
    size: {
      width: 300,
      height: 600
    }
  }
}
</script>

<style scoped>
.box{
  position: relative;
  width: 100%;
  height: 100%;
  /* background-color: red; */
}

.title{
  position: absolute;
  -webkit-appearance: none;
  border: none;
  outline: none;
  background: transparent;

  top: -30px;
  left: 120px;
  white-space: nowrap;

  /* text-decoration: underline; */

  transform: scale(1.5);
  width: 50px;
  height: 10px;
  font-size: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  overflow: visible;
}

.converstaion {
  overflow: scroll;
  -webkit-overflow-scrolling: touch;
  height: calc(100% - 40px);
}
.bubble-taller{
  height: 70px;
}
.wrap-me{
  display: flex;
  justify-content: flex-end;
}
.wrap-others{
  display: flex;
  justify-content: flex-start;
}

.bubble{
  margin: 10px;
  border-radius: 7px;
  padding: 10px;
  max-width: 100%;
  overflow: hidden;
}
.box-me{
  background-image: linear-gradient(45deg, blue, violet);
  color: white;
}
.box-others{
  background-image: linear-gradient(45deg, hotpink, cyan);
  color: white;
}

.comment-input{
  position: absolute;
  width: 100%;
  background-image: linear-gradient(45deg, hotpink, cyan);
  bottom: 0px;
  left: 0px;
  height: 40px;
  border: none;
  border-top: grey solid 1px;
  border-bottom: grey solid 1px;
}
.text-input{
  border: none;
  outline: none;
  /* border-top: grey solid 1px; */
  /* border-bottom: grey solid 1px; */
  border-right: grey solid 1px;
  height: 32px;
  width: 240px;
  background-color: transparent;
  border-radius: 0px;
  appearance: none;
  padding-left: 10px;
}
.sender{
  border: none;
  border-radius: 0px;
  margin: 0px;
  margin-top: -1px;
  padding: 0px;
  appearance: none;
  height: 40px;
  background-color: transparent;
  width: 30px;
}
</style>
