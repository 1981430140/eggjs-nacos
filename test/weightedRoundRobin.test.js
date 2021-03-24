'use strict';

const assert = require('assert');
const WeightedRoundRobin = require('../lib/weightedRoundRobin');


describe('test/weightedRoundRobin.test.js', () => {
  let wrr;
  const pool = [
    { ip: '10.43.116.31', port: 7001, healthy: true, weight: 1, },
    { ip: '10.43.116.32', port: 7001, healthy: true, weight: 1, },
    { ip: '10.43.116.33', port: 7001, healthy: true, weight: 1, }
  ]

  before(async () => {
    wrr = new WeightedRoundRobin(pool);
  });

  after(async () => {

  });

  it('should constructor ok', async function () {
    const thisWrr1 = new WeightedRoundRobin();
    const service1 = await thisWrr1.pick();
    assert(!service1);

    const service = { ip: '10.1.2.32', port: 7001, healthy: true };
    const thisWrr2 = new WeightedRoundRobin([
      { ip: '10.1.2.31', port: 7001, healthy: true, weight: 1, },
      service,
    ], { defaultWeight: 20 });
    for (let i = 0; i < 19; i++) {
      assert(await thisWrr2.pick() === service);
    }

  });

  it('should pick ok', async function () {
    pool.forEach(item => {
      assert(wrr.pick().ip === item.ip);
    });
  });

  it('should reset ok', async function () {
    const curPool = [
      { ip: '127.0.0.1', port: 7001, healthy: true, weight: 1, },
      { ip: '127.0.0.2', port: 7001, healthy: true, weight: 1, }
    ]
    await wrr.reset(curPool)
    curPool.forEach(item => {
      assert(wrr.pick().ip === item.ip);
    });
  });

  it('should reset empty', async function () {
    await wrr.reset([])
    assert(!wrr.pick());
  });

  it('should reset error', async function () {
    let message;
    try {
      await wrr.reset()
    } catch (error) {
      message = error.message;
    }
    assert(message === '[eggjs-nacos] Property ‘pool’ must is Array!');
  });

  it('should batch pick ', async function () {
    const curPool = [
      { ip: '127.0.0.1', port: 7001, healthy: true, weight: 10, },
      { ip: '127.0.0.2', port: 7001, healthy: true, weight: 20, },
      { ip: '127.0.0.3', port: 7001, healthy: true, weight: 30, }
    ];
    await wrr.reset(curPool);

    const countObj = {};
    for (let i = 0; i < 12; i++) {
      const service = wrr.pick();
      if (countObj[service.ip]) {
        countObj[service.ip] = ++countObj[service.ip]
      } else {
        countObj[service.ip] = 1
      }
    }

    assert(countObj['127.0.0.1'] === 2); // 12 * (1/6)
    assert(countObj['127.0.0.2'] === 4); // 12 * (2/6)
    assert(countObj['127.0.0.3'] === 6); // 12 * (3/6)
  });

});
