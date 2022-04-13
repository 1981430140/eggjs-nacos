'use strict';
require('../index').setEnv();
/**
 * @param {Egg.EggAppInfo} appInfo - { baseDir, root, env, ... }
 */
module.exports = () => {
  /**
   * 框架内置配置
   * @type {Egg.EggAppConfig}
   */
  const config = {};
  
  config.nacos = {
    serverList: '',
    isRegisterInstance: true, // 是否注册实例， 默认true （v1.1.8 加入配置）
    client: {
      namespace: '',
      serviceName: '',
      groupName: '',
    },
    subscribers: {
      // test01Service: {
      //   serviceName: 'egg-test', // 服务名称
      //   groupName: '', // 默认 DEFAULT_GROUP
      //   clusters: '', // 默认 DEFAULT
      //   subscribe: true, // 是否订阅  默认 true  
      // },
      // test02Service: {
      //   serviceName: 'egg-test02', // 服务名称
      // },
    }
  };

  return config;
};
