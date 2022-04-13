'use strict';

const assert = require('assert');
const { address } = require('ip');
const { NacosNamingClient } = require('nacos');
const Subscribe = require('./lib/subscribe');

/**
 * @param {Egg} app - egg application
 */
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
    const { serverList, client, isRegisterInstance } = this.app.config.nacos;
    assert(!!serverList, '[eggjs-nacos] Property ‘serverList’ is required!');
    assert(!!client.namespace, '[eggjs-nacos] Property ‘namespace’ is required!');

    const nacosClient = new NacosNamingClient({
      logger: this.app.logger,
      serverList,
      ...client,
    })

    await nacosClient.ready();

    this.app.nacosClient = nacosClient;

    this.app.messenger.once('egg-server-realport', async port => {
      this.app.logger.info('[eggjs-nacos] egg-server-realport:', port);

      // 是否注册实例
      if (isRegisterInstance) {
        // 获取服务ip
        const ip = address();

        // serviceName 不存在就拿 package.json 中的服务名
        const serviceName = client.serviceName || this.app.name;
        const groupName = client.groupName || 'DEFAULT_GROUP';
        // 注销注册时使用
        Object.assign(client, { serviceName, ip, port, groupName })

        try {
          // 注册实例 
          this.app.logger.info('[eggjs-nacos] 注册参数', serviceName, ip, port, groupName);
          await nacosClient.registerInstance(serviceName, { ip, port }, groupName);
          this.app.logger.info('[eggjs-nacos] 注册成功');
        } catch (error) {
          this.app.logger.error('[eggjs-nacos] 注册失败 ERROR:', error);
        }
      } else {
        this.app.logger.info(`[eggjs-nacos] 配置 isRegisterInstance: ${isRegisterInstance} ，已关闭默认注册实例`);
      }
      // 订阅实例
      this.app.nacosSubscribe = new Subscribe(this.app);
    });

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
    if (this.app.nacosClient) {
      try {
        const { isRegisterInstance, client: { serviceName, groupName, ip, port } } = this.app.config.nacos;
        if (isRegisterInstance && serviceName && ip && port) {
          this.app.logger.info('[eggjs-nacos] 注销参数', serviceName, ip, port, groupName);
          await this.app.nacosClient.deregisterInstance(serviceName, { ip, port }, groupName)
          this.app.logger.info('[eggjs-nacos] 注销成功')
        }
      } catch (error) {
        this.app.logger.info('[eggjs-nacos] 注销失败 ERROR', error)
      } finally {
        await this.app.nacosClient.close();
      }
    }
  }
}

module.exports = AppBootHook;