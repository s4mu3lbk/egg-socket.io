'use strict'

const { Server } = require('socket.io')

const SocketIOSymbol = Symbol.for('EGG-SOCKET.IO#IO')

const RouterConfigSymbol = Symbol.for('EGG-SOCKET.IO#ROUTERCONFIG')

const assert = require('assert')
const is = require('is-type-of')

module.exports = {
  get io() {
    if (!this[SocketIOSymbol]) {
      this[SocketIOSymbol] = new Server()
      this[SocketIOSymbol].serveClient(false)

      Object.getPrototypeOf(this[SocketIOSymbol]).route = function() {
        return this.sockets.route.apply(this.sockets, arguments)
      }

      Object.getPrototypeOf(this[SocketIOSymbol].of('/')).route = function(event, handler) {
        assert(is.string(event), 'event must be string!')

        if (!this[RouterConfigSymbol]) {
          this[RouterConfigSymbol] = new Map()
        }

        if (!this[RouterConfigSymbol].has(event)) {
          this[RouterConfigSymbol].set(event, handler)
        }
      }

    }
    return this[SocketIOSymbol]
  },
}
