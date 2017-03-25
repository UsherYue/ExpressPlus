/**
 * PHPProject
 * Helper.php Created by usher.yue.
 * User: usher.yue
 * Date: 17/1/8
 * Time: 下午5:27
 * 心怀教育梦－烟台网格软件技术有限公司
 */

'use strict';

var fs = require('fs');

//加载系统模块 用户模块
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser')

var multer = require('multer');
var logger = require('morgan');



var app = express();

//body content json解析
app.use(bodyParser.json());

// for parsing application/json
app.use(bodyParser.json({limit: '10mb'}));

//body content urlencode
app.use(bodyParser.urlencoded({extended: false}));

//support cookie
app.use(cookieParser());

//express-seesion
app.use(session({
    name:'sessionid',
    secret:'f-u-c-k-!',
    resave:false,
    proxy:true,
    saveUninitialized:true,
    maxAge:60*60*1000*24  ,//24h
    cookie:{
        maxAge:60*1000*60*24
    }
}));

//config加载
({
    routers: [],
    ns: [],
    init: function () {
        this._initNs();
        this._initDb();
        this._initRedis();
        this._initStatic();
        this._initApp(__dirname + "/common/");
        this._initRouter(__dirname + '/routes/');
        this._initModules(__dirname + '/models/');
        this._initCommonFunc();
        this._initProcess();
    },
    _initRouter: function (path) {
        let $this = this;
        let files = fs.readdirSync(path);
        files.forEach(function (file, index) {
            let stat = fs.statSync(path + file)
            let routeFileName = file.replace(/(.*\/)*([^.]+).*/ig, "$2");
            let regRxp = /.+\/routes\/(.+)$/ig;
            let routePath = '';
            if (stat.isFile()) {
                let subModule = require(path + routeFileName);
                $this.routers.push(subModule);
                let r = regRxp.exec(path + routeFileName);
                routePath = (r == null) ? '' : r[1];
                //load route mapping
                let routeUriMapping = $this._loadNs(routePath);
                routeUriMapping.forEach(function (value, index) {
                    app.use(value, subModule);
                })
            } else if (stat.isDirectory()) {
                $this._initRouter(path + routeFileName + "/")
            }
        });
    },
    _initModules: function (path) {
        if (!global.models) {
            global.models = {};
        }
        if (!this.modelRoot) {
            this.modelRoot = path;
        }
        if (typeof(global.M) == 'undefined') {
            global.M = model => !global.models[model] ? null : global.models[model];
        }
        let fs = require('fs');
        let $this = this;
        let files = fs.readdirSync(path);
        files.forEach(function (file, index) {
            let stat = fs.statSync(path + file)
            let moduleFileName = file.replace(/(.*\/)*([^.]+).*/ig, "$2");
            let routePath = '';
            if (stat.isFile()) {
                let modulePath = path + moduleFileName;
                let subModule = require(modulePath);
                let modelRelativePath = modulePath.replace($this.modelRoot, '');
                //k-v access
                global.models[modelRelativePath] = subModule;
                let modulePathArray = modelRelativePath.split('/');
                //一级目录
                if (modulePathArray.length >>> 1) {
                    let obj = global.models;
                    modulePathArray.forEach(function (value, index, array) {
                        if (index != array.length - 1) {
                            if (!obj[value]) {
                                obj[value] = {};
                            }
                            obj = obj[value];
                        } else {
                            obj[value] = subModule;
                        }
                    })
                }
            } else if (stat.isDirectory()) {
                $this._initModules(path + moduleFileName + "/");
            }
        });
    },
    _initStatic: function () {
        if (!global.config.staticConfig || !global.config.staticConfig.length) {
            app.use('/static', express.static('static'));
        } else {
            global.config.staticConfig.forEach(function (item, index, array) {
                app.use(item.router, express.static(item.path,{index:item.index?item.index:'index.html'}));
            });
        }
    },
    _initRedis: function () {
        if (!global.config.redisConfig || !global.config.redisConfig.host) {
            return;
        }
        let redisServerIp = global.config.redisConfig.host;
        let redisServerPort = (!global.config.redisConfig.port) ? 6379 : global.config.redisConfig.port;
        let redisServerDb = (!global.config.redisConfig.db) ? 0 : global.config.redisConfig.db;
        let redisServerPassword = (!global.config.redisConfig.password) ? '' : global.config.redisConfig.password;
        let opt = {
            host: redisServerIp,
            port: redisServerPort,
            db: redisServerDb,
            retry_strategy: function (options) {
                if (options.error && options.error.code === 'ECONNREFUSED') {
                    return new Error('服务器拒接连接');
                }
                //1小时后停止连接
                if (options.total_retry_time > 1000 * 60 * 60) {
                    return new Error('重试时间耗尽');
                }
                // 1s后重新尝试连接
                return Math.min(options.attempt * 1000, 3000);
            }
        };
        if (redisServerPassword) {
            opt.password = global.config.redisConfig.password;
        }
        let redis = require("redis"),
            client = redis.createClient(opt);
        client.on('error', function (err) {
            console.error("redis error....");
        })
        global.redis = client;
    },
    _loadNs: function (routePath) {
        //默认在根路由下
        if (this.ns[routePath] == undefined) {
            return ['/'];
        }
        return this.ns[routePath];
    },
    _initNs: function () {
        let $this = this;
        let nsConfig = global.config.nsConfig;
        for (var key in nsConfig) {
            let nsItem = nsConfig[key];
            switch ((typeof(nsItem)).toLowerCase()) {
                case 'string': {
                    if (this.ns[nsItem] != undefined) {
                        let itemType = (typeof($this.ns[nsItem])).toLowerCase();
                        if (itemType == 'string') {
                            this.ns[nsItem] = [$this.ns[nsItem], key]
                        } else if (itemType == 'object') {
                            this.ns[nsItem].push(key);
                        }
                    } else {
                        this.ns[nsItem] = [key];
                    }
                    break;
                }
                case 'object': {
                    nsItem.forEach(function (value, index) {
                        if ($this.ns[value] != undefined) {
                            $this.ns[value].push(key);
                        } else {
                            $this.ns[value] = [key];
                        }
                    });
                    break;
                }
            }
        }
    },
    _initDb: function ($this) {
        let Sequelize = require('sequelize');
        if (!global.config.dbConfig.dbtype) {
            console.error('miss dbtype conf.....');
        }
        if (!global.config.dbConfig.dbname) {
            console.error('miss dbname  conf.....');
        }
        Sequelize.prototype.select = function (sql) {
            return this.query(sql, {type: this.QueryTypes.SELECT}).catch(function (ex) {
                console.log(ex.errors);
                return false;
            });
        }
        Sequelize.prototype.insert = function (sql) {
            return this.query(sql, {type: this.QueryTypes.INSERT}).catch(function (ex) {
                console.log(ex);
                return false;
            }).then(function (result) {
                return result;
            });
        }
        Sequelize.prototype.delete = function (sql) {
            return this.query(sql, {type: this.QueryTypes.DELETE}).catch(function (ex) {
                console.log(ex);
                return false;
            });
        }
        Sequelize.prototype.update = function (sql) {
            return this.query(sql, {type: this.QueryTypes.UPDATE}).catch(function (ex) {
                console.log(ex);
                return false;
            }).then(function (result) {
                return true;
            });
        }
        try {
            Sequelize.prototype.getPages = function (sql, currentPage, pageCount, retTotal) {
                currentPage = (currentPage <= 0) ? 1 : currentPage;
                pageCount = (pageCount <= 0) ? 10 : pageCount;
                let $this = this;
                let begin = (currentPage - 1) * pageCount;
                return new Promise(function (resolve, reject) {
                    let countSql = sql.trim().toLowerCase().replace(/(select\b)(.+)\b(from.+)\b(group.+)\b(order.+)/ig, '$1 count(1) as `count` $3 $4');
                    let querySql = sql + ' limit ' + begin.toString() + ',' + pageCount.toString();
                    let total = 0;
                    $this.query(querySql, {type: Sequelize.QueryTypes.SELECT}).then(function (resultItems) {
                        if (retTotal) {
                            if (retTotal) {
                                $this.query(countSql, {type: Sequelize.QueryTypes.SELECT}).then(function (resultCount) {
                                    let count = resultCount.length > 1 ? resultCount.length : (resultCount.length == 1 ? resultCount[0].count : 0);
                                    resolve({
                                        total: count,
                                        pageCount: parseInt(count / pageCount) + ((count % pageCount > 0) ? 1 : 0),
                                        data: resultItems,
                                        currentPage: currentPage
                                    });
                                }).catch(function (err) {
                                    reject(err);
                                });
                            } else {
                                resolve({
                                    // total: 0,
                                    // pageCount: 9999,
                                    data: resultItems,
                                    currentPage: currentPage
                                });
                            }
                        }
                    }).catch(function (err) {
                        resolve(false);
                    });
                });
            }
            var sequelize = new Sequelize(global.config.dbConfig.dbname, null, null, {
                //支持bigint issues
                //https://github.com/sequelize/sequelize/issues/1222
                dialectOptions: (!global.config.dbConfig.dialectOptions) ? {} : global.config.dbConfig.dialectOptions,
                dialect: global.config.dbConfig.dbtype,
                replication: {
                    read: (!global.config.dbConfig.read) ? {} : global.config.dbConfig.read,
                    write: (!global.config.dbConfig.write) ? {} : global.config.dbConfig.write
                },
                pool: (!global.config.dbConfig.pool) ? {
                        maxConnections: 20,
                        maxIdleTime: 30000
                    } : global.config.dbConfig.pool,
            });
            //golbal database
            global.db = sequelize;
        } catch (e) {
            console.error('db init error!....');
        }
    },
    _initApp: function (commonPath) {
        global.express = express;
        global.newRouter = function () {
            let router = express.Router();
            router.uploadFile = (mapUri, savePath, fileKey, callback) => {
                var uploadHandler = multer({dest: savePath});
                router.post(mapUri, uploadHandler.single(fileKey), callback);
            };
            return router;
        }
        let files = fs.readdirSync(commonPath);
        files.forEach(function logArrayElements(element, index, array) {
                let moduleName = element.replace(/(.*)\.js/ig, "$1");
                global[moduleName] = require(commonPath + (moduleName));
            }
        );
        global.newSqlBuilder = function () {
            return Object.create(sqlbuilder);
        }
        global.co = require('co');
    },
    _initCommonFunc: function () {
        if (typeof(Object.values) !== 'function') {
            Object.values = function (obj) {
                var values = [];
                for (var key in obj) {
                    values.push(obj[key]);
                }
                return values;
            }
        }
        if (!Date.now) {
            Date.now = function now() {
                return new Date().getTime();
            };
        }
        global.return = (ret, data, msg) => ({ret: ret, data: data, msg: msg})
        global.error = (data, msg) => ({ret: 0, data: data, msg: msg});
        global.success = (data, msg) => ({ret: 1, data: data, msg: msg});
    },
    _initProcess: function () {
        //防止进程退出
        process.on('uncaughtException', (err) => {
            console.log(err.message);
        });
    }
}).init();


//debug 生产环境直接注释
app.use(logger('dev'));


//捕获404状态码
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

//错误处理
app.use(function (err, req, res, next) {
    //在开发环境下提供错误处理
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.send('server error:' + err.message);
});


module.exports = app;
