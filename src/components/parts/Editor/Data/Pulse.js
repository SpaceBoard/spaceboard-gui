import * as network from './Network.js'
var socket = network.api.socket
var rest = network.api.rest

rest.get('/api/posts')
  .then(function (response) {
    console.log(response.data)
  })
  .catch((e) => {
    console.log(e)
  })

socket.emit('up/counter', {
  browserData: 'fun  fun fun'
})
socket.on('dn/counter', (data) => {
  console.log(data)
})

function dummy ({ data, root }) {
  var array = root.realtime.items[data.arrayName]
  var result = array.filter((item) => { return item.id === data.item.id })
  var index = array.indexOf(result[0])
  console.log(data.item)
  if (array[index]) {
    array[index].data = data.item.data
  }
}

export function setupRealtime ({ readRoot, $forceUpdate }) {
  socket.emit('up/join', {
    spaceID: readRoot.realtime.id
  })
  socket.on(`dn/spaceboard`, (data) => {
    console.log(data)
    dummy({ data, root: readRoot })
    // $forceUpdate()
  })
}

export function onCreateItem ({ item, arrayName }) {
}

export function onDelete ({ item, arrayName, id }) {

}

export function onItemPulse ({ spaceID, item, arrayName, id }) {
  socket.emit('up/spaceboard', {
    spaceID,
    arrayName,
    item,
    id
  })
}
