
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

export function textBox (configFn) {
  var size = { width: 200, height: 200 }
  configFn = configFn || (() => { return {} })
  return {
    id: uuid(),
    ...positioner(),
    size,
    arrayName: 'textBoxes',
    component: 'TextBox',
    ...configFn({ size })
  }
}
