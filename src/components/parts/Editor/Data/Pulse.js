// import * as Data from './DataStructure'
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
  }
}

function dataCreator ({ data, root }) {
  var array = root.realtime.items[data.arrayName]
  console.log(data)
  array.push(data.item)
}

function dataRemover ({ data, root }) {
  var array = root.realtime.items[data.arrayName]
  var result = array.filter((item) => { return item.id === data.item.id })
  var index = array.indexOf(result[0])
  array.splice(index, 1)
}

// function dataRootReader ({ data, root }) {
//   if (data.item.id === root.realtime.id) {
//     return root
//   } else {
//     return false
//   }
// }

export function setupRealtimeUpdaters ({ readRoot, writeRoot, viewAttention, $forceUpdate }) {
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
    socket.on(`dn/space@remove/` + arrayName, (data) => {
      dataRemover({ data, root: readRoot })
    })
  })
  socket.on(`dn/space@attention`, (data) => {
    console.log(data)
    viewAttention(data)
    $forceUpdate()
  })
}

export function onAttention ({ spaceID, attention }) {
  socket.emit(`up/space@attention`, {
    spaceID,
    attention
  })
}

export function onItemHydration ({ spaceID }) {
  return rest.get('/api/space/demo')
    .then((res) => {
      return res.data
    })
}

export function onItemCreation ({ spaceID, item, arrayName, id }) {
  socket.emit('up/space@add/' + arrayName, {
    spaceID,
    arrayName,
    item,
    id
  })
}

export function onItemDeletion ({ spaceID, item, arrayName, id }) {
  socket.emit('up/space@remove/' + arrayName, {
    spaceID,
    arrayName,
    item,
    id
  })
}

export function onItemPulse ({ spaceID, item, arrayName, id }) {
  socket.emit('up/space@update/' + arrayName, {
    spaceID,
    arrayName,
    item,
    id
  })
}

export function getDownloadLink ({ spaceID, fileID }) {
  return network.api.baseURL + `/api/space/${spaceID}/file/${fileID}`
}

export function onDownloadFile ({ spaceID, fileID }) {
  return rest.get(`/api/space/${spaceID}/file/${fileID}`)
    .then((res) => {
      console.log(res)
      return res.data
    })
}

export function onUploadFile ({ spaceID, fileID, fileData, onUploadProgress }) {
  onUploadProgress = onUploadProgress || (() => {})

  var data = new FormData()
  data.append('media', fileData)

  return rest.post(`/api/space/${spaceID}/file/${fileID}`, data, {
    onUploadProgress
  }).then((res) => {
    return res.data
  })
}
