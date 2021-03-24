'use strict';

const assert = require('assert');
const { toHump } = require('../lib/utils');

describe('test/utils.test.js', () => {

  it('should ok', async function () {
    const str1 = 'testData';
    assert(toHump(str1) === 'testData');

    const str2 = 'test_data';
    assert(toHump(str2) === 'testData');

    const str3 = 'test_data_test';
    assert(toHump(str3) === 'testDataTest');

    const str4 = 'data_test_';
    assert(toHump(str4) === 'dataTest');

    const str5 = 'test__';
    assert(toHump(str5) === 'test');

    const str6 = '__test__';
    assert(toHump(str6) === 'test');
  });


});
