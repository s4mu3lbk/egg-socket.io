'use strict'

const http = require('http')
const assert = require('assert')
const is = require('is-type-of')
const redis = require('socket.io-redis')
const { utils } = require('egg-core')
const compose = require('koa-compose')

const loader = require('./loader')
const connectionMiddlewareInit = require('./connectionMiddlewareInit')

const RouterConfigSymbol = Symbol.for('EGG-SOCKET.IO#ROUTERCONFIG')

module.exports = app => {
  loader(app)
  const config = app.config.io

  const namespace = config.namespace

  app.beforeStart(async () => {
    for (const nsp in namespace) {
      const connectionMiddlewareConfig = namespace[nsp].connectionMiddleware

      let connectionMiddlewares = []

      if (connectionMiddlewareConfig) {
        assert(
          is.array(connectionMiddlewareConfig),
          'config.connectionMiddleware must be Array!'
        )
        for (const middleware of connectionMiddlewareConfig) {
          assert(
            app.io.middleware[middleware],
            `can't find middleware: ${middleware} !`
          )
          connectionMiddlewares.push(app.io.middleware[middleware])
        }
      }

      const sessionMiddleware = app.middleware.filter(mw => {
        return mw._name && mw._name.startsWith('session')
      })[0]

      connectionMiddlewares.unshift(sessionMiddleware)
      connectionMiddlewares = connectionMiddlewares.map(mw =>
        utils.middleware(mw)
      )
      connectionMiddlewares = compose(connectionMiddlewares)

      initNsp(app.io.of(nsp), connectionMiddlewares)
    }
  })

  const errorEvent = {
    disconnect: 1,
    error: 1,
    disconnecting: 1,
  }

  function initNsp(nsp, connectionMiddlewares) {
    nsp.on('connection', socket => {
      if (nsp[RouterConfigSymbol]) {
        for (const [ event, handler ] of nsp[RouterConfigSymbol].entries()) {
          if (errorEvent[event]) {
            socket.on(event, (...args) => {
              const request = socket.request
              request.socket = socket
              const ctx = app.createContext(
                request,
                new http.ServerResponse(request)
              )
              ctx.args = args
              handler.call(ctx).catch(e => {
                e.message =
                  '[egg-socket.io] controller execute error: ' + e.message
                app.coreLogger.error(e)
              })
            })
          } else {
            socket.on(event, (...args) => {
              const request = socket.request
              request.socket = socket
              const ctx = app.createContext(
                request,
                new http.ServerResponse(request)
              )
              ctx.args = args
              handler
                .call(ctx)
                .then(() => {})
                .catch(e => {
                  if (e instanceof Error) {
                    e.message =
                      '[egg-socket.io] controller execute error: ' + e.message
                  } /* istanbul ignore next */ else {
                    console.log(e)
                  }
                })
            })
          }
        }
      }
    })

    nsp.use((socket, next) => {
      connectionMiddlewareInit(app, socket, next, connectionMiddlewares)
    })
  }

  if (config.redis) {
    const adapter = redis(config.redis)
    // https://github.com/socketio/socket.io-redis/issues/21
    // adapter.pubClient.on('error', function(err){app.coreLogger.error(err);});
    // adapter.subClient.on('error', function(err){app.coreLogger.error(err);});
    app.io.adapter(adapter)
  }

  app.on('server', server => {
    app.io.attach(server, config.init)

    // Check whether it's a common function, it shouldn't be
    // an async or generator function, or it will be ignored.
    if (
      typeof config.generateId === 'function' &&
      !is.asyncFunction(config.generateId) &&
      !is.generatorFunction(config.generateId)
    ) {
      app.io.engine.generateId = config.generateId
    }
  })
}
