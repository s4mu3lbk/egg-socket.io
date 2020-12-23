# egg-socket.io

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

egg 框架的 socket.io 插件
原作者许久未更新， 将 socket.io 升级到了 3.0

```bash
io.of(namespace).route(event, callback)
```

路由的写法改为 =>

```bash
io.route(event, callback, namespace)
```

packet 的 middleware 去掉了
