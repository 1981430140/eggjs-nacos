const assert = require('assert');
const { NacosNamingClient } = require('nacos');
const WeightedRoundRobin = require('./weightedRoundRobin');
const Request = require('./request');
const { toHump } = require('./utils');

class Nacos {
  constructor(app) {
    const { serverList, client, subscribers } = app.config.nacos;
    assert(!!serverList, '[eggjs-nacos] Property ‘serverList’ is required!');
    assert(!!client.namespace, '[eggjs-nacos] Property ‘namespace’ is required!');

    this._ready = false;
    this._nacosClient = new NacosNamingClient({
      logger: app.logger,
      serverList,
      ...client
    });

    this._serviceInfoMap = new Map();
    Object.keys(subscribers).forEach(key => {
      const info = subscribers[key];
      const { serviceName, subscribe = true } = info;
      this[toHump(key)] = new Request(this, info);
      if (subscribe) {
        app.messenger.on(`nacos_subscribe_${serviceName}`, hosts => {
          app.logger.info(`[eggjs-nacos] app 监听订阅更新 - ${serviceName}`, hosts);
          this._reset(serviceName, hosts);
        });
      }
    })
    this.ready();
    app.nacos = this;
  }

  /**
   * 更新数据池
   * @param { string } serviceName 实例名称
   * @param { Array<Object> } hosts 新实例数据池
   */
  _reset(serviceName, hosts) {
    assert(!!serviceName, '[eggjs-nacos] Property ‘serviceName’ is required!');
    assert(!!hosts, '[eggjs-nacos] Property ‘hosts’ is required!');
    if (!this._serviceInfoMap.has(serviceName)) {
      this._serviceInfoMap.set(serviceName, new WeightedRoundRobin(hosts));
    } else {
      this._serviceInfoMap.get(serviceName).reset(hosts);
    }
  }
  async ready() {
    await this._nacosClient.ready();
    this._ready = true;
  }
}
module.exports = Nacos;
