'use strict';

module.exports = () => {
  const config = {};

  config.nacos = {
    serverList: '',
    client: {
      namespace: '',
      serviceName: '',
      groupName: '',
    },
  };

  return config;
};
