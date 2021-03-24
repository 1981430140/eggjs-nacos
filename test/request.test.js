'use strict';

const assert = require('assert');
const { find } = require('lodash');
const Request = require('../lib/request');
const WeightedRoundRobin = require('../lib/weightedRoundRobin');

describe('test/request.test.js', () => {
  let req;
  const pool = [
    { ip: "127.0.0.1", port: 7001, healthy: true, weight: 1, },
    { ip: "127.0.0.1", port: 7002, healthy: true, weight: 2, },
  ]

  const newPool = [
    { ip: "localhost", port: 7003, healthy: true, weight: 2, },
    { ip: "localhost", port: 7004, healthy: true, weight: 3, }
  ]

  const serviceInfo = { serviceName: 'test01' };
  const serviceInfoMap = new Map();
  serviceInfoMap.set(serviceInfo.serviceName, new WeightedRoundRobin(pool));
  const nacos = {
    _serviceInfoMap: serviceInfoMap,
    _nacosClient: {
      selectInstances: () => newPool
    },
    ready(){}
  }

  before(async () => {
    req = new Request(nacos, serviceInfo);
  });

  after(async () => {

  });

  it('should request ok', async function () {
    try {
      const res = await req.request('/test');
      assert(res && res.status);
    } catch (err) {
      assert(find(pool, { ip: err.address }));
      assert(find(pool, { port: err.port }));
    }
  });


  it('should pick ok', async function () {
    const res = await req.pick();
    assert(find(pool, { ip: res.ip }));
  });

  it('should pick ok2', async function () {
    serviceInfoMap.set(serviceInfo.serviceName, new WeightedRoundRobin())
    req = new Request(nacos, serviceInfo);
    const res = await req.pick();
    assert(find(newPool, { ip: res.ip, port: res.port }));
  });

});
