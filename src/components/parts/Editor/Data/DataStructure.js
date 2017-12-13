
export function getPos ({ diff }) {
  return {
    x: diff.x,
    y: diff.y,
    z: 0
  }
}

export function positioner ({ diff = { x: 0, y: 0 } }) {
  return {
    pos: getPos({ diff })
  }
}

export function generateUID () {
  // I generate the UID from two parts here
  // to ensure the random number provide enough bits.
  var firstPart = (Math.random() * 46656) | 0
  var secondPart = (Math.random() * 46656) | 0
  firstPart = ('000' + firstPart.toString(36)).slice(-3)
  secondPart = ('000' + secondPart.toString(36)).slice(-3)
  return firstPart + secondPart
}

export function textBox (config) {
  var size = { width: 200, height: 200 }
  if (config.posDiff) {
    config.posDiff.x += size.width * 1.0
    // config.posDiff.y += size.height * 0.5
  }
  return {
    id: generateUID(),
    ...positioner({ diff: config.posDiff }),
    size,
    arrayName: 'textBoxes',
    component: 'TextBox',
    ...config
  }
}
