/**
 * ApiBareFramework
 *  Created by usher.yue.
 * User: usher.yue
 * Date: 17/2/18
 * Time: 16:58
 */

let assert = require('assert');
let http=require('../app/common/http');
let co=require('co');
//  expect('2').to.be.a('string');
//  var expect = require('chai').expect;
//  expect('2').to.be.a('string');
describe('测试http工具',function () {
    it('http Get测试',function (done) {
        co(function *() {
            var data = yield http.get('https://baidu.com',false)
            assert(data);
            done();
        });
    });
    before(()=>console.info("在本区块的所有测试用例之前执行"))
    after(()=>console.info("在本区块的所有测试用例之后执行"))
    beforeEach(()=>console.info("在本区块的每个测试用例之前执行"))
    afterEach(()=>console.info("在本区块的每个测试用例之后执行"))

    it('http Post测试',function (done) {
        co(function *() {
            var data = yield http.get('https://baidu.com',{},false)
            console.log(data);
            assert(data);
            done();
        });
    })

})


