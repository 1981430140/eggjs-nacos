const { NacosConfigClient } = require('nacos-config');
const fs = require('fs');
const assert = require('assert');
const dotenv = require('dotenv');
const defualtPath = __dirname + '/nacos.env';

/**
 * 获取远程Nacos配置
 * @param {*} clientOptions 连接nacos的参数
 * @param {*} configOptions 要获取的配置参数
 * @returns 会设置到环境变量的数据
 */
const fetchRemoteNacosConfig = async (clientOptions, configOptions) => {
  assert(clientOptions, '[eggjs-nacos] Property ‘clientOptions’ is required!');
  assert(Array.isArray(configOptions), '[eggjs-nacos] Property ‘configOptions’ must is Array!');

  const config = {};

  for (const options of configOptions) {
    assert(Object.prototype.toString.call(options) === '[object Object]', `[eggjs-nacos] Property ‘${options}’ must is Object!`);
    const namespace = options.namespace || clientOptions.namespace;
    assert(namespace, '[eggjs-nacos] Property ‘namespace’ is required!');
    assert(options.configs, '[eggjs-nacos] Property ‘configs’ is required!');
    const configClient = new NacosConfigClient({ ...clientOptions, namespace });
    try {
      const configTasks = [];

      options.configs.forEach(item => {
        assert(Object.prototype.toString.call(item) === '[object Object]', `[eggjs-nacos] Property ‘${item}’ must is Object!`);
        const { dataId, group } = item;
        assert(dataId, '[eggjs-nacos] Property ‘dataId’ is required!');
        assert(group, '[eggjs-nacos] Property ‘group’ is required!');
        configTasks.push(configClient.getConfig(dataId, group))
      });

      const configs = await Promise.all(configTasks);

      configs.forEach(item => {
        try {
          item = JSON.parse(item);
          if (Object.prototype.toString.call(item) === '[object Object]') {
            Object.assign(config, item);
          }
        } catch (error) {
          try {
            // 匹配key=val中的key和val
            Object.assign(config, dotenv.parse(item));
          } catch (error) {
            assert(false, error);
          }
        }
      });

    } catch (error) {
      assert(false, error);
    } finally {
      await configClient.close();
    }
  }

  // 写入到 nacos.env 文件中
  createEnvFile(config);

  return config;
}

// 生成 nacos.env
const createEnvFile = config => {
  if (fs.existsSync(defualtPath)) {
    fs.unlinkSync(defualtPath);
  }
  for (let key of Object.keys(config)) {
    fs.appendFileSync(defualtPath, `${key}=${config[key]}\n`);
  }
}

/**
 * 注入到环境变量
 */
const setEnv = () => {
  try {
    dotenv.config({ path: defualtPath });
  } catch (err) {
    assert(false, err);
  }
}

module.exports = {
  fetchRemoteNacosConfig,
  createEnvFile,
  setEnv
};