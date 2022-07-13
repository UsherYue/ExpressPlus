/**
 * ExpressPlus
 * _initDb.js Created by usher.yue.
 * User: usher.yue
 * Date: 2022/7/13
 * Time: 16:26
 * 乘风破浪－烟台聚货吧电子商务有限公司
 */

let Sequelize = require('sequelize');
if (!config?.dbConfig?.dbtype ?? false) {
    console.error('dbConfig.dbtype error!  ');
    process.exit(-1);
}
if (!config?.dbConfig?.dbname ?? false) {
    console.error('dbConfig.dbname error!  ')
    process.exit(-1);
}
Sequelize.prototype.select = function (sql) {
    return this.query(sql, {type: this.QueryTypes.SELECT}).then(function (result) {
        return result;
    }, function (ex) {
        return false;
    });
};
Sequelize.prototype.selectOne = function (sql) {
    let $this = this;
    return new Promise(function (resolve, reject) {
        $this.query(sql, {type: $this.QueryTypes.SELECT}).then(function (result) {
            resolve(result.length == 0 ? null : result[0])
        }, function (ex) {
            reject(false);
        });
    });
};
Sequelize.prototype.insert = function (sql) {
    return this.query(sql, {type: this.QueryTypes.INSERT}).then(function (result) {
        return result;
    }, function (ex) {
        return false;
    });
};
Sequelize.prototype.delete = function (sql) {
    return this.query(sql, {type: this.QueryTypes.DELETE}).then(function (result) {
        return true;
    }, function (ex) {
        return false;
    });
};
Sequelize.prototype.update = function (sql) {
    return this.query(sql, {type: this.QueryTypes.UPDATE}).then(function (result) {
        return true;
    }, function (ex) {
        return false;
    });
};
try {
    /**
     * 仅仅支持单一SQL分页 不支持子查询
     * @param sql
     * @param currentPage
     * @param pageCount
     * @param retTotal
     * @param countFields
     * @returns {Promise<unknown>}
     */
    Sequelize.prototype.getPages = function (sql, currentPage, pageCount, retTotal, countFields = 1) {
        currentPage = (currentPage <= 0) ? 1 : currentPage;
        pageCount = (pageCount <= 0) ? 10 : pageCount;
        let $this = this;
        let begin = (currentPage - 1) * pageCount;
        return new Promise(function (resolve, reject) {
            let countSql = sql.trim().toLowerCase().removeSubRight('limit').removeSubRight('order').replace(/^(select\b)([^from]+)(\bfrom\b.+)(\bgroup\b.+)?(\border\b.+)?/ig, `$1 count(${countFields}) as \`count\` $3 $4`);
            let querySql = sql + ' limit ' + begin.toString() + ',' + pageCount.toString();
            $this.query(querySql, {type: Sequelize.QueryTypes.SELECT}).then(function (resultItems) {
                if (retTotal) {
                    $this.query(countSql, {type: Sequelize.QueryTypes.SELECT}).then(function (resultCount) {
                        let count = resultCount.length > 1 ? resultCount.length : (resultCount.length == 1 ? resultCount[0].count : 0);
                        resolve({
                            total: count,
                            pagesize: parseInt(pageCount),
                            totalpage: parseInt(count / pageCount) + ((count % pageCount > 0) ? 1 : 0),
                            list: resultItems,
                            current: parseInt(currentPage)
                        });
                    }).catch(function (err) {
                        reject(err);
                    });
                } else {
                    resolve({
                        total: 99999,
                        pagesize: parseInt(pageCount),
                        totalpage: 999,
                        list: resultItems,
                        current: parseInt(currentPage)
                    });
                }
            }).catch(function (err) {
                resolve(false);
            });
        });
    }
    /**
     * 自定义传入count sql
     * @param sql
     * @param currentPage
     * @param pageCount
     * @param countSql
     * @returns {Promise<unknown>}
     */
    Sequelize.prototype.getPages_v2 = function (sql, currentPage, pageCount = 10, countSql = null) {
        currentPage = (currentPage <= 0) ? 1 : currentPage;
        pageCount = (pageCount <= 0) ? 10 : pageCount;
        let $this = this;
        let begin = (currentPage - 1) * pageCount;
        return new Promise(function (resolve, reject) {
            let querySql = sql + ' limit ' + begin.toString() + ',' + pageCount.toString();
            $this.query(querySql, {type: Sequelize.QueryTypes.SELECT}).then(function (resultItems) {
                if (countSql) {
                    $this.query(countSql, {type: Sequelize.QueryTypes.SELECT}).then(function (resultCount) {
                        let count = resultCount.length > 1 ? resultCount.length : (resultCount.length == 1 ? resultCount[0].count : 0);
                        resolve({
                            total: count,
                            pagesize: parseInt(pageCount),
                            totalpage: parseInt(count / pageCount) + ((count % pageCount > 0) ? 1 : 0),
                            list: resultItems,
                            current: parseInt(currentPage)
                        });
                    }).catch(function (err) {
                        reject(err);
                    });
                } else {
                    resolve({
                        total: 99999,
                        pagesize: parseInt(pageCount),
                        totalpage: 999,
                        list: resultItems,
                        current: parseInt(currentPage)
                    });
                }
            }).catch(function (err) {
                resolve(false);
            });
        });
    }
    let sequelize = new Sequelize(global.config.dbConfig.dbname, null, null, {
        //支持bigint issues
        //https://github.com/sequelize/sequelize/issues/1222
        timezone: '+08:00',
        logging: false,
        dialectOptions: (config?.dbConfig?.dialectOptions ?? {}),
        dialect: config.dbConfig.dbtype,
        replication: {
            read: (config?.dbConfig?.read ?? {}),
            write: (config?.dbConfig?.write ?? {})
        },
        pool: config?.dbConfig?.pool ?? {
            maxConnections: 20,
            min: 5,
            maxIdleTime: 30000
        },
    });

    //Test DB Connect
    sequelize.authenticate().then(function (e) {
        colorlog.success('Database', 'Conntent To Database Success');
    }).catch(function (e) {
        colorlog.warning('Database', 'Unable to connect to the database For Reason:' + JSON.stringify(e.message));
    });
    //other db source
    if (config.dbConfigOther) {
        global.dbOthers = {};
        let sourceNames = Object.keys(config.dbConfigOther);
        for (let sourceName of sourceNames) {
            // global.dbOther[sourceName]=
            let sourceDBConfig = config.dbConfigOther[sourceName];
            let tmpSequelize = new Sequelize(sourceDBConfig.dbname, null, null, {
                timezone: '+08:00',
                logging: false,
                dialectOptions: sourceDBConfig?.dialectOptions ?? {},
                dialect: sourceDBConfig.dbtype,
                replication: {
                    read: sourceDBConfig?.read ?? {},
                    write: sourceDBConfig?.write ?? {}
                },
                pool: sourceDBConfig?.pool ?? {
                    maxConnections: 20,
                    min: 5,
                    maxIdleTime: 30000
                },
            });
            tmpSequelize.authenticate().then(function (e) {
                colorlog.success('Database', `Conntent To Other  Database Source ${sourceName} Success`);
            }).catch(function (e) {
                colorlog.warning('Database', `Unable to connect to the Database Source ${sourceName} For Reason:` + JSON.stringify(e.message));
            });
            //save  other db source
            global.dbOthers[sourceName] = tmpSequelize;
        }
    }
    //db source list
    global.dbSourceList = () => Object.keys(global.dbOthers);
    //select other db
    global.selectDBSource = (sourceName) => global.dbOthers[sourceName];
    //golbal database
    global.db = sequelize;
    global.DB = Sequelize;
    global.VModel = (tableName, dbSource = global.db) => new (require(`${APP_ROOT}/core/adapter/orm/mysql-base`)(dbSource)(tableName));
} catch (e) {
    console.error('db init error!....');
}