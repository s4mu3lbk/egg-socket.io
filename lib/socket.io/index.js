'use strict';

const { Server } = require('socket.io');
const assert = require('assert');
const is = require('is-type-of');

const RouterConfigSymbol = Symbol.for('EGG-SOCKET.IO#ROUTERCONFIG');

Server.prototype.route = function (event, handler, nsp = '/') {
  assert(is.string(event), 'event must be string!');

  if (!this.of(nsp)[RouterConfigSymbol]) {
    this.of(nsp)[RouterConfigSymbol] = new Map();
  }

  if (!this.of(nsp)[RouterConfigSymbol].has(event)) {
    this.of(nsp)[RouterConfigSymbol].set(event, handler);
  }
};

module.exports = Server;
