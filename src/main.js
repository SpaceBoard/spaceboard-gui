// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import $ from 'webpack-zepto'
window.$ = $

Vue.config.productionTip = false

var VueTouch = require('vue-touch-easyhi')
Vue.use(VueTouch)
VueTouch.registerCustomEvent('doubletap', {
  type: 'tap',
  taps: 2
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
