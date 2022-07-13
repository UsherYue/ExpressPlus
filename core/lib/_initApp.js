/**
 * ExpressPlus
 * _initApp.js Created by usher.yue.
 * User: usher.yue
 * Date: 2022/7/13
 * Time: 16:17
 * 乘风破浪－烟台聚货吧电子商务有限公司
 */
const  fs=require('fs');
const  path=require('path');
const multer = require('multer');

module.exports=(commonPath,express)=>{
    global.express = express;
    //路由增加过滤器
    global.newRouter = function (...filters) {
        let router = express.Router();
        //手动增加路由注解
        router.filters = filters;
        router.uploadFile = (mapUri, savePath, fileKey, callback) => {
            var uploadHandler = multer({dest: savePath});
            router.post(mapUri, uploadHandler.single(fileKey), callback);
        };
        return router;
    }
    let files = fs.readdirSync(commonPath);
    files.forEach(function logArrayElements(element, index, array) {
            let moduleName = element.replace(/(.*)\.js/ig, "$1");
            let modulePath = path.resolve(commonPath + (moduleName));
            global[moduleName] = require(modulePath);
        }
    );
    //单进程em
    global.eventSender = require('events').EventEmitter;
    global.newSqlBuilder = function () {
        let sqlModel = Object.create(sqlbuilder);
        /**
         * 可选择数据源
         * @param dbSource
         * @returns {*}
         */
        sqlModel.do = (dbSource=false) => {
            let tmpDb=db;
            if(!dbSource){
                tmpDb=selectDBSource(dbSource);
            }
            let sql = sqlModel.sql().trimLeft();
            if (/^insert\b.*/i.test(sql)) {
                return tmpDb.insert(sql);
            } else if (/^select.*/i.test(sql)) {
                return tmpDb.select(sql);
            } else if (/^update.*/i.test(sql)) {
                return tmpDb.update(sql);
            } else if (/^delete.*/i.test(sql)) {
                return tmpDb.delete(sql);
            }
            return sqlModel.sql();
        }
        sqlModel.getPages = (currentPage, pageCount, retTotal, countFields = 1) => {
            let countSql = '';
            if (retTotal) {
                //生成count sql
                countSql = sqlModel.countSql(countFields);
            }
            return db.getPages_v2(sqlModel.sql(), currentPage, pageCount, countSql);
        };
        return sqlModel;
    }
    global.sqlBuilder = newSqlBuilder();
    global.co = require('co');
}