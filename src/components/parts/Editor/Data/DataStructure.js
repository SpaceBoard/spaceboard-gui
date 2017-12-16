
export function getPos () {
  return {
    x: 0,
    y: 0,
    z: 0
  }
}

export function positioner () {
  return {
    pos: getPos()
  }
}

export function uuid () {
  // I generate the UID from two parts here
  // to ensure the random number provide enough bits.
  var firstPart = (Math.random() * 46656) | 0
  var secondPart = (Math.random() * 46656) | 0
  firstPart = ('000' + firstPart.toString(36)).slice(-3)
  secondPart = ('000' + secondPart.toString(36)).slice(-3)
  return firstPart + secondPart
}

export function makeComment ({ text = 'New Text', uid = 'user1', name = '', colorA, colorB }) {
  return {
    uid,
    name,
    date: new Date(),
    text,
    colorA,
    colorB
  }
}

export function commentBox (config = { sampleComments: [] }) {
  var size = require('../CommentBox/CommentBox.vue').default.info.size
  config.sampleComments = config.sampleComments || []
  return {
    id: uuid(),
    ...positioner(),
    size,
    arrayName: 'commentBoxes',
    component: 'CommentBox',
    data: {
      title: 'My New CommentBox',
      comments: [
        ...config.sampleComments
      ]
    },
    ...config
  }
}

export function drawboard (config = {}) {
  var size = require('../Drawboard/Drawboard.vue').default.info.size
  return {
    id: uuid(),
    ...positioner(),
    size,
    arrayName: 'drawboards',
    component: 'Drawboard',
    data: {
      title: 'My New DrawBoard',
      undo: [],
      lines: []
    },
    ...config
  }
}

export function textBox (configFn) {
  var size = require('../TextBox/TextBox.vue').default.info.size
  configFn = configFn || (() => { return {} })
  return {
    id: uuid(),
    ...positioner(),
    size,
    arrayName: 'textBoxes',
    component: 'TextBox',
    data: {
      text: `New Text`
    },
    ...configFn({ size })
  }
}

export function fileBox (config) {
  var size = require('../FileBox/FileBox.vue').default.info.size
  return {
    id: uuid(),
    ...positioner(),
    size,
    arrayName: 'files',
    component: 'FileBox',
    data: {
      progress: 0,
      link: false
    },
    ...config
  }
}
