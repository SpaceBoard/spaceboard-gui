
export function getPos () {
  return {
    x: window.scrollX,
    y: window.scrollY,
    z: 0
  }
}

export function positioner () {
  return {
    pos: getPos()
  }
}

export function textBox (config) {
  return {
    ...positioner(),
    size: { width: 200, height: 200 },
    ...config
  }
}
