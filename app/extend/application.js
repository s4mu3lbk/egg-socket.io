'use strict';

const SocketIO = require('../../lib/socket.io');

const SocketIOSymbol = Symbol.for('EGG-SOCKET.IO#IO');

module.exports = {
  get io() {
    if (!this[SocketIOSymbol]) {
      this[SocketIOSymbol] = new SocketIO();
      this[SocketIOSymbol].serveClient(false);
    }
    return this[SocketIOSymbol];
  },
};
