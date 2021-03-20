'use strict';

const assert = require('assert');
const { address } = require('ip');
const { NacosNamingClient } = require('nacos');
require('./index').setEnv();

class AppBootHook {
  constructor(app) {
    this.app = app;
  }

  async configWillLoad() {
    //准备调用configDidLoad
    //配置，引用插件文件，
    //这是修改配置的最后机会。
  }

  configDidLoad() {
    //Config，插件文件已加载。
  }

  async didLoad() {
    //所有文件都已加载，请在此处启动插件。
    const { serverList, client } = this.app.config.nacos;
    assert(!!serverList, 'serverList 不能为空!');
    assert(!!client.namespace, 'namespace 不能为空!');

    const nacosClient = new NacosNamingClient({
      logger: this.app.logger,
      serverList,
      namespace: client.namespace,
    })

    await nacosClient.ready();

    this.app.messenger.once('egg-server-realport', async port => {
      this.app.logger.info('[egg-nacos] egg-server-realport:', port);

      // 获取服务ip
      const ip = address();

      // serviceName 不存在就拿 package.json 中的服务名
      const serviceName = client.serviceName || this.app.name;
      const groupName = client.groupName || 'DEFAULT_GROUP';
      Object.assign(client, { serviceName, ip, port, groupName })

      try {
        // 注册实例 
        this.app.logger.info('[egg-nacos] 注册参数', serviceName, ip, port, groupName);
        await nacosClient.registerInstance(serviceName, { ip, port }, groupName);
        this.app.logger.info('[egg-nacos] 注册成功');
      } catch (error) {
        this.app.logger.error('[egg-nacos] 注册失败 ERROR:', error);
      }

      this.app.logger.info('[egg-nacos] client', client);
    })
    this.nacosClient = nacosClient;
  }

  async willReady() {
    //所有插件都已启动，可以在应用就绪之前做一些事情 
  }

  async didReady() {
    //worker已经准备好，可以做一些事情
    //不需要阻止应用启动。 
  }

  async serverDidReady() {

  }

  async beforeClose() {
    //在应用关闭之前先干点事
    try {
      const { serviceName, groupName, ip, port } = this.app.config.nacos.client;
      this.app.logger.info('[egg-nacos] 注销参数', serviceName, ip, port, groupName);
      await this.nacosClient.deregisterInstance(serviceName, { ip, port }, groupName)
      this.app.logger.info('[egg-nacos] 注销成功')
    } catch (error) {
      this.app.logger.info('[egg-nacos] 注销失败 ERROR', error)
    }
    await this.nacosClient.close();
  }
}

module.exports = AppBootHook;