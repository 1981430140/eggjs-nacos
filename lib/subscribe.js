const assert = require('assert');
const { difference } = require('lodash');
/**
 * 
 */
class Subscribe {
  constructor(agent) {
    const { logger, nacosClient, config: { nacos: { subscribers = [] } } } = agent;

    this.serviceInfoMap = new Map();
    Object.keys(subscribers).forEach(key => {
      const info = subscribers[key];
      const { serviceName, subscribe = true } = info;
      if (subscribe) {
        assert(!!serviceName, '[eggjs-nacos] Property ‘serviceName’ is required!');
        nacosClient.subscribe(info, hosts => {
          logger.info(`[eggjs-nacos] agent 监听订阅更新-${serviceName}`, hosts);
          this.serviceInfoMap.set(serviceName, hosts);
          // 发送给所有的app
          agent.messenger.sendToApp(`nacos_subscribe_${serviceName}`, hosts)
        });

        this.opids = agent.messenger.opids;
        agent.messenger.on('egg-pids', pids => {
          const newPids = difference(pids, this.opids);
          this.opids = pids;
          newPids.forEach(pid => {
            this.serviceInfoMap.forEach((v,k)=>{
              agent.messenger.sendTo(pid, `nacos_subscribe_${k}`, v)
            })
          });
        });
      }
    })
  }

}
module.exports = Subscribe;
