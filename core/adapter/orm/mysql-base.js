/**
 * ExpressPlus
 * mysql-base.js Created by usher.yue.
 * User: usher.yue
 * Date: 2022/3/2
 * Time: 14:05
 * 乘风破浪－mysql虚拟模型类
 */
const util = require('util');

/**
 * @param db
 * @returns {object}
 */
module.exports = function (db) {
    return (tableName) => {
        return class {
            /**
             * 直接生成虚拟模型
             * @param
             */
            constructor() {
            }

            /**
             * 绑定表
             * @type {*[]}
             */
            #tableName = tableName;

            /**
             * 数据库驱动
             * @type {*}
             */
            #db = db;

            /**
             * 获取绑定表
             * @returns {*}
             */
            get tableName() {
                return this.#tableName;
            }

            /**
             * rawSQL
             * @param querySql
             * @returns {null}
             */
            async query(querySql) {
                return null;
            }

            /**
             * raw SQL
             * @param execSql
             * @returns {null}
             */
            async exec(execSql) {
                return null;
            }

            /**
             *
             * @param $where
             * @returns {null}
             */
            async getOne($where) {

                return null;

            }

            /**
             * 返回描述
             * @returns {null}
             */
            async desc() {
                return null;
            }

            /**
             *
             * @param $where
             * @returns {null}
             */
            async hasOne($where) {
                return null;

            }

            /**
             *
             * @param $where
             * @returns {null}
             */
            async get($where) {
                return null;

            }


            /**
             *
             * @param $where
             * @returns {null}
             */
            async has($where) {
                return null;
            }

            /**
             *
             * @param $where
             * @returns {null}
             */
            async update($where) {
                return null;

            }

            /**
             *
             * @param $where
             * @returns {null}
             */
            async delete($where) {
                return null;

            }

            /**
             *
             * @param $where
             * @returns {null}
             */
            async insert($where) {
                return null;

            }

            /**
             *
             * @param $where
             * @returns {null}
             */
            async count($where) {
                return null;

            }

            /**
             *
             * @param $where
             * @returns {null}
             */
            async group($where) {
                return null;

            }

            /**
             *
             * @param $where
             * @returns {null}
             */
            async expr($where) {
                return null;

            }

            /**
             *
             * @param $where
             * @returns {null}
             */
            async getJoin($where) {
                return null;

            }
        }
    }
};