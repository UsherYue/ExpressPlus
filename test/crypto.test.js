/**
 * ApiBareFramework
 *  Created by usher.yue.
 * User: usher.yue
 * Date: 17/3/23
 * Time: 16:37
 * 心怀教育梦－烟台网格软件技术有限公司
 */

let assert = require('chai').assert;
let crypto=require('../common/crypto');

describe('加密测试', function () {
    it('md5测试', done => {
        console.log(crypto.md5('111111'));
        done();
    });
});