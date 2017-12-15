export function disableDoubleTap (el) {
  var IS_IOS = /iphone|ipad/i.test(navigator.userAgent)
  if (!IS_IOS) { return }
  el.addEventListener('touchstart', (evt) => {
    var t2 = evt.timeStamp
    var t1 = el['lastTouch'] || t2
    var dt = t2 - t1
    var fingers = evt.originalEvent.touches.length
    el['lastTouch'] = t2
    if (!dt || dt > 500 || fingers > 1) return
    evt.preventDefault()
    el.click()
    el.click()
  }, false)
}
