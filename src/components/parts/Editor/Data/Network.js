import axios from 'axios'
import io from 'socket.io-client'

var isProduction = (process.env.NODE_ENV === 'production')

var socket = io(isProduction ? 'https://spaceboard.herokuapp.com' : 'http://' + window.location.hostname + ':3000')

var rest = axios.create({
  baseURL: isProduction ? 'https://spaceboard.herokuapp.com' : 'http://' + window.location.hostname + ':3000'
})

export const api = {
  socket,
  rest
}
