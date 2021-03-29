const httpclient = require('urllib');
const DEFAULT_GROUP = 'DEFAULT_GROUP';

class Request {
  constructor(nacos, serviceInfo) {
    const { serviceName, groupName, clusters, subscribe = true } = serviceInfo;
    this.nacos = nacos;
    this.serviceName = serviceName;
    this.groupName = groupName || DEFAULT_GROUP;
    this.clusters = clusters || '';
    this.subscribe = subscribe;
  }

  /**
   * 发起请求
   * @param { string } url 
   * @param { object } options https://www.npmjs.com/package/urllib#arguments
   * @returns 
   */
  async request(url, options = {}) {
    const instance = await this.pick();
    if (!instance) throw new Error('[eggjs-nacos] No instance available!');

    url = `${instance.ip}:${instance.port}${url}`;
    
    return httpclient.request(url, Object.assign({}, this._builderOptions(), options));  
  }

  /**
   * 挑选个实例
   * @param { string } serviceName 实例名称
   * @returns 
   */
  async pick() {
    // 如果订阅了并且数据池中有数据就从中获取
    if (this.subscribe && this.nacos._serviceInfoMap.has(this.serviceName)) {
      const instance = this.nacos._serviceInfoMap.get(this.serviceName).pick();
      if (instance) return instance;
    }
    const instances = await this.selectInstances();
    if (!instances.length) return null;

    // 随机选择一个实例
    const random = (Math.random() * instances.length) >>> 0;
    return instances[random];
  }

  /**
   * 从远程 nacos 中获取实例 
   * @returns 
   */
  async selectInstances() {
    if (!this.nacos._ready) await this.nacos.ready();
    return this.nacos._nacosClient.selectInstances(this.serviceName, this.groupName, this.clusters, true, false);
  }

  _builderOptions() {
    return {
      method: 'GET',
      dataType: 'json',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    };
  }
}
module.exports = Request;