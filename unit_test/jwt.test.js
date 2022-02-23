/**
 * ExpressPlus
 * jwt.test.js Created by usher.yue.
 * User: usher.yue
 * Date: 2022/2/23
 * Time: 16:27
 * 乘风破浪－jwt单元测试
 */

let assert = require('chai').assert;
let jwt=require('../common/jwt');
const secret="aaddsdsd";

describe('jwt测试', async function () {
    it('jwt签名', done => {
        let token=jwt.sign({a:1},'1h',secret)
        console.log(token)
        done();

    });
    it('jwt验证签名',  done => {
        let data= jwt.verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjE2NDU2MDU0MDUsImV4cCI6MTY0NTYwOTAwNX0.RYUTHmck42DNnztAoUQW6rq1HG-VsErz4_3rg5ZXFi0',secret)
        data.then(function (ret){
            console.log(ret)
        })
        done();
    });

});