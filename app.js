
const Nacos = require('./lib/nacos');

/**
 * @param {Egg.Application} app - egg application
 */
class AppBootHook {
  constructor(app) {
    this.app = app;
  }

  configWillLoad() {
    // Ready to call configDidLoad,
    // Config, plugin files are referred,
    // this is the last chance to modify the config.
  }

  configDidLoad() {
    // Config, plugin files have been loaded.
  }

  async didLoad() {
    new Nacos(this.app);
  }

  async willReady() {
    // All plugins have started, can do some thing before app ready
  }

  async didReady() {
    // Worker is ready, can do some things
    // don't need to block the app boot.
  }

  async serverDidReady() {
    // 将服务监听的端口发送给agent
    if(this.app.server){
      this.app.messenger.sendToAgent('egg-server-realport', this.app.server.address().port);
    }
  }

  async beforeClose() {
    // Do some thing before app close.
  }
}

module.exports = AppBootHook;