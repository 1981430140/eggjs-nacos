const DEFAULT_WEIGHT = 10;
const assert = require('assert');
/**
 * 
 * @param { Array<Object> } pool 实例服务数据池
 * @param { Object } options 选项 { defaultWeight: number }
 */
class WeightedRoundRobin {
  constructor(pool, options) {
    
    const { defaultWeight } = options || {};

    pool = pool || [];

    /** 默认权重 10  */
    this._defaultWeight = defaultWeight || DEFAULT_WEIGHT;

    /** 数据池  */
    this._pool = [];

    /**权重的最大公约数*/
    this._gcdWeight;

    /**上次选择的服务器*/
    this._currentIndex;

    /**当前调度的权值*/
    this._currentWeight;

    /**最大权重*/
    this._maxWeight;

    this.reset(pool);
  }

  get size() {
    return this._pool.length;
  }

  /**
   * 重置数据池
   * @param {*} pool 
   * @returns 
   */
  reset(pool) {
    if (Object.prototype.toString.call(pool) !== '[object Array]') {
      throw new Error('[eggjs-nacos] Property ‘pool’ must is Array!');
    }

    let maxWeight = 0;
    const healthyPool = []
    const weights = [];
    pool.forEach(item => {
      /** 只保留健康有效的实例 */
      if (Object.prototype.toString.call(item) === '[object Object]' && item.healthy === true) {
        healthyPool.push(item);
        item.weight = item.weight || this._defaultWeight;

        weights.push(item.weight);

        maxWeight = Math.max(maxWeight, item.weight);
      }
    });

    this._gcdWeight = this._gcd(...weights);
    this._maxWeight = maxWeight;
    this._pool = healthyPool;
    this._currentIndex = -1;
    this._currentWeight = 0;

    return this._pool;
  }

  /**
   * 欧几里得算法（求最大公约数）
   * @param  {...any} arr 
   * @returns 
   */
  _gcd(...arr) {
    if (!arr.length) return 0;
    const data = [].concat(...arr);

    return data.reduce((x, y) => {
      return !y ? x : this._gcd(y, x % y);
    });
  }

  /**
   * 根据权重挑选出一个实例
   * @returns 
   */
  pick() {
    if (!this.size) return null;
    while (true) {
      this._currentIndex = (this._currentIndex + 1) % this.size;

      if (this._currentIndex === 0) {
        this._currentWeight = this._currentWeight - this._gcdWeight;

        if (this._currentWeight <= 0) {
          this._currentWeight = this._maxWeight;

          if (this._currentWeight === 0) return null;
        }
      }

      const service = this._pool[this._currentIndex];

      if (service.weight >= this._currentWeight) {
        return service;
      }
    }
  }

}

module.exports = WeightedRoundRobin;
