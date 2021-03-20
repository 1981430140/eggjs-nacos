const { NacosConfigClient } = require('nacos-config');
const fs = require('fs');
const assert = require('assert');
const dotenv = require('dotenv');
const defualtPath = __dirname + '/nacos.env';

/**
 * 获取远程Nacos配置
 * @param {*} clintOptions 连接nacos的参数
 * @param {*} configOptions 要获取的配置参数
 * @returns 会设置到环境变量的数据
 */
const fetchRemoteNacosConfig = async (clintOptions, configOptions) => {
  assert(clintOptions, '参数 clintOptions 必传!');
  assert(Array.isArray(configOptions), '参数 configs 必须是个Array!');

  const configClient = new NacosConfigClient(clintOptions);
  const config = {
    'nacos.namespace': clintOptions.namespace || "public",
    'nacos.serverAddr': clintOptions.serverAddr || clintOptions.endpoint,
  };
  try {
    const configTasks = [];
    configOptions.forEach(item => {
      assert(Object.prototype.toString.call(item) === '[object Object]', `${item} 必须是一个Object`);
      const { dataId, group } = item;
      assert(dataId, 'dataId 不能为空');
      assert(group, 'group 不能为空');
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

    // 写入到 nacos.env 文件中
    createEnvFile(config);
  } catch(error){
    assert(false, error);
  } finally {
    configClient.close();
  }
  
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