## 安装插件

```bash
$ npm i eggjs-nacos --save
```

## 开启插件

1. 服务注册

开启插件后，启动时服务会注册到 Nacos, 请确保 config 中 nacos.serverList 和 nacos.client 已填写。多进程下单一注册服务

2. 服务发现

配置 nacos.subscribers 后, 启动服务时会自动监听配置的服务。多进程下单一发现服务

```js
// {app_root}/config/plugin.js
exports.nacos = {
  enable: true,
  package: "eggjs-nacos",
};
```

## 配置

```js
// {app_root}/config/config.default.js
exports.nacos = {
  serverList: "", // 必填，  nacos 服务url
  client: {
    namespace: "", // 必填，  命名空间ID，用于后续服务注册、服务发现
    serviceName: "", // 非必填, 服务名称， 默认自动获取package.json中的name
    groupName: "", // 非必填, 分组名称 默认 DEFAULT_GROUP
    username: 'user', // 非必填
    password: 'pass', // 非必填
  },
  subscribers: {
    test01Service: {
      serviceName: "egg-test", // 服务名称
      groupName: "", // 默认 DEFAULT_GROUP
      clusters: "", // 默认 DEFAULT
      subscribe: true, // 是否订阅服务  默认 true
    },
    test02Service: {
      serviceName: "egg-test02", // 服务名称
      subscribe: false,
    },
  },
};
```

## 使用

test01Service 服务已订阅的话将根据权重轮训向实例发起请求

```js
const result = await this.ctx.nacos.test01Service.request("/tab/list"); // 默认 GET 请求
if (result.status !== 200) throw Error("Error ...");
console.log(result.data);
```

### 或

test02Service 服务未订阅的话每次调用会向 Nacos 服务器获取实例，然后在这些实例中随机挑选一个发起请求

```js
const options = {
  method: "POST",
  dataType: "json",
  timeout: 30000,
  data: { a: "11", b: "22" },
};
const result = await this.ctx.nacos.test02Service.request(
  "/tab/create",
  options
);
if (result.status !== 200) throw Error("Error ...");
console.log(result.data);
```

## 获取配置中心

具体用法和 [node-apollo](https://www.npmjs.com/package/node-apollo) 使用一样

{app_root}/nacos.js

```js
const { fetchRemoteNacosConfig } = require("eggjs-nacos");
fetchRemoteNacosConfig(
  {
    serverAddr: "127.0.0.1:8848",
    namespace: "dev", // 命名空间ID
  },
  [
    {
      namespace: "public", // 命名空间ID， 优先使用这里配置的命名空间ID
      configs: [
        {
          dataId: "com.dq.redis",
          group: "DEFAULT_GROUP",
        },
      ],
    },
    {
      // 未配置命名空间的话默认使用上面的 dev
      configs: [
        {
          dataId: "com.dq.test",
          group: "DEFAULT_GROUP",
        },
      ],
    },
  ]
).then((data) => {
  console.log("env：", data);
});
```

{app_root}/package.json

```js
...
"scripts": {
  "dev": "node nacos.js && egg-bin dev",
  "start": "node nacos.js && egg-scripts start"
}
...
```

{app_root}/config/config.default.ts

```js
...
config.redis = {
  client: {
    host: process.env["redis.host"], // 从环境变量中读取配置
    port: process.env["redis.port"],
    password: process.env["redis.password"],
    db: process.env["redis.db"],
  },
};
...
```

## APIs

### service

- `request(url, options)` 向实例发起请求.
  - url {String} url 地址
  - options {[RequestOptions](https://www.npmjs.com/package/urllib#arguments)}
- `pick()` 挑选一个实例.
- `selectInstances()` 获取所有实例.

### config

- `fetchRemoteNacosConfig(clientOptions, configOptions)` 获取远程 Nacos 配置信息
  - clientOptions {[ClientOptions]( https://github.com/nacos-group/nacos-sdk-nodejs/blob/master/packages/nacos-config/src/interface.ts#L247)}
  - configOptions {Array}
    - namespace {String} 命名空间 ID, 优先使用
    - configs {Array}
      - dataId {String}
      - group {String} 分组
- `createEnvFile(config)` 将配置信息写入到文件
  - config {Object}
- `setEnv()` 注入到环境变量

## License

[BSD-2-Clause](LICENSE)
