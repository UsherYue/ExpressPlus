/**
 * ApiBareFramework
 *  Created by usher.yue.
 * User: usher.yue
 * Date: 17/3/23
 * Time: 16:37
 */

let assert = require('chai').assert;
let crypto=require('../app/common/crypto');

describe('加密测试', function () {
    it('md5测试', done => {
        console.log(crypto.md5('111111'));
        done();
    });
});