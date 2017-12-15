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

function dataUpdater ({ data, root }) {
  var array = root.realtime.items[data.arrayName]
  var result = array.filter((item) => { return item.id === data.item.id })
  var index = array.indexOf(result[0])
  console.log(data.item)
  if (array[index]) {
    for (var key in data.item) {
      array[index][key] = data.item[key]
    }
    // var keys = Object.keys[data.item]
    // keys.filter(k => k === 'data').forEach((key) => {
    //   array[index][key] = data.item[key]
    // })
    // array[index] = {
    //   ...array[index],
    //   ...data.item
    // }
    // array[index].data = data.item.data
  }
}

function dataCreator ({ data, root }) {
  var array = root.realtime.items[data.arrayName]
  console.log(data)
  array.push(data.item)
}

export function setupRealtimeUpdaters ({ readRoot, $forceUpdate }) {
  socket.emit('up/join/space', {
    spaceID: readRoot.realtime.id
  })
  Object.keys(readRoot.realtime.items).forEach((arrayName) => {
    socket.on(`dn/space@update/` + arrayName, (data) => {
      dataUpdater({ data, root: readRoot })
    })
    socket.on(`dn/space@add/` + arrayName, (data) => {
      dataCreator({ data, root: readRoot })
    })
  })
}

export function onItemHydration () {

}

export function onItemCreation ({ spaceID, item, arrayName, id }) {
  socket.emit('up/space@add/' + arrayName, {
    spaceID,
    arrayName,
    item,
    id
  })
}

export function onItemDeletion ({ item, arrayName, id }) {

}

export function onItemPulse ({ spaceID, item, arrayName, id }) {
  socket.emit('up/space@update/' + arrayName, {
    spaceID,
    arrayName,
    item,
    id
  })
}
