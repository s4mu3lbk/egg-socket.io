# egg-socket.io

基于作者最后 4.1.6 一版更新
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
