## 安装插件

```bash
$ npm i eggjs-nacos --save
```

## 使用

```js
// {app_root}/config/plugin.js
exports.nacos = {
  enable: true,
  package: 'eggjs-nacos',
};
```

## 配置

```js
// {app_root}/config/config.default.js
exports.nacos = {
  serverList: '',     // 必填，  nacos 服务url
  client: {
    namespace: '',    // 必填，  命名空间ID
    serviceName: '',  // 非必填, 服务名称， 默认自动获取package.json中的name
    groupName: '',    // 非必填, 分组名称 默认 DEFAULT_GROUP
  },
};
```

## License

[BSD-2-Clause](LICENSE)