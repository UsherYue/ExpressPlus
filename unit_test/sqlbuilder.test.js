/**
 * ApiBareFramework
 *  Created by usher.yue.
 * User: usher.yue
 * Date: 17/2/21
 * Time: 10:51
 */
let assert = require('chai').assert;
//  expect('2').to.be.a('string');
//  var expect = require('chai').expect;
//  expect('2').to.be.a('string');
let sqlBuilder = require('../common/sqlbuilder');
describe('测试sql工具', function () {
    it('sql where测试', done => {
        let $where = [];
        $where['id'] = ['in', [1, 2, 3, 4, 5]];
        $where['count'] = ['>', 10];
        $where['count1'] = [['<=', 100], ['>', 10], ['<>', 100]];
        $where['d'] = ['<>', 1200];
        $where['qw'] = 1;
        $where['qsdw'] = 11;
        $where['xxx'] = ['betweeN', 1, 2];
        $where['name'] = ['like', '%ccc_'];
        let sql = sqlBuilder.select("*").from("a").where(
            $where
        ).and($where).and($where).or($where).sql();
        console.log(sql);
        done();
    });

    it('sql set测试', done => {
        let $set = [];
        $set['a']=['+','a',1];
        $set['b']=['%','b','4'];
        $set['e']='expr:errcount+1';
        let sql=sqlBuilder.update('a').set($set).sql();
        console.log(sql);
        done();
    });
})
