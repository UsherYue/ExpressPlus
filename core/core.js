/**
 * PHPProject
 * Helper.php Created by usher.yue.
 * User: usher.yue
 * Date: 17/1/8
 * Time: 下午5:27
 * core入口
 */

'use strict';

//加载系统模块
var fs = require('fs');
var path = require('path');

var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');

//用户模块
var core = express();

var multer = require('multer');
var logger = require('morgan');

//body content json解析
core.use(bodyParser.json());

// for parsing application/json
core.use(bodyParser.json({limit: '10mb'}));

//body content urlencode
core.use(bodyParser.urlencoded({extended: false}));

//support cookie
core.use(cookieParser());

//express-seesion
core.use(session({
    name: 'sessionid',
    secret: 'f-u-c-k-!',
    store: (() => {
        if (!global.config.sessionConfig || !global.config.sessionConfig.driver || global.config.sessionConfig.driver.toLowerCase() == 'memory')
            return null;
        switch (global.config.sessionConfig.driver) {
            case 'sequelize': {
                var SequelizeStore = require('connect-session-sequelize')(session.Store);
                return new SequelizeStore({
                    db: global.db
                })
            }
            case 'mysql': {
                var MySQLStore = require('express-mysql-session')(session);
                return new MySQLStore(global.config.sessionConfig.options);
            }
            case 'redis': {
                var RedisStore = require('connect-redis')(session);
                return new RedisStore(global.config.sessionConfig.options);
            }
            case 'file': {
                var FileStore = require('session-file-store')(session);
                return new FileStore(global.config.sessionConfig.options);
            }
            case 'memcached': {
                var MemcachedStore = require('connect-memcached')(session);
                return new MemcachedStore(global.config.sessionConfig.options);
            }
        }
    })(),
    resave: false,
    proxy: true,
    saveUninitialized: true,
    maxAge: 60 * 60 * 1000 * 24 * 365,//24h
    cookie: {
        //set sessionid expires
    }
}));

//delete DEBUG_FD
delete process.env["DEBUG_FD"];

//config加载
({
    routers: [],
    ns: [],
    init: function () {
        this._initNs();
        this._initDb();
        this._initRedis();
        this._initStatic();
        this._initTemplate();
        this._initMiddleWare();
        this._initCommonFunc();
        this._initAnnotation();
        this._initI18N(`${APP_PATH}lang`, '.json');
        this._initApp(`${APP_PATH}common/`);
        this._initRouter(`${APP_PATH}routes/`);
        this._initModules(`${APP_PATH}models/`);
        this._initProcess();
    },
    _initRouter: function (path) {
        let $this = this;
        let files = fs.readdirSync(path);
        files.forEach(async function (file, index) {
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
                //放在前面否则存在服务器启动无法注册路由
                routeUriMapping.forEach(function (value, index) {
                    core.use(value, subModule);
                });
                //////////////////注解拦截////////////////////////
                let routerFile = path + routeFileName + '.js';
                await $this._analysisAnnotationFile(routerFile, async (tmpAnnotationMap) => {
                    routeUriMapping.forEach(function (value, index) {
                        if (!global.annotationMap) {
                            global.annotationMap = {};
                        }
                        for (let k in tmpAnnotationMap) {
                            let keyArr = k.split(':');
                            let routerKey = `${keyArr[0]}:${value == '/' ? '' : value}${keyArr[1]}`;
                            global.annotationMap[routerKey] = tmpAnnotationMap[k];
                            if (subModule.filters && subModule.filters.length) {
                                let filters = subModule.filters.map((v, idx, arr) => {
                                    return v.name;
                                });
                                global.annotationMap[routerKey].push(`@Filter:${filters.join(',')}`);
                            }
                        }
                    });
                });
                ////////////////////////////注解拦截///////////////////////////////////
            } else if (stat.isDirectory()) {
                $this._initRouter(path + routeFileName + "/")
            }
        });
    },
    _analysisAnnotationFile: async function (routerFile, fn) {
        const fs = require('fs');
        const readline = require('readline');
        //create read  stream
        const fileStream = fs.createReadStream(routerFile);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });
        let codeLines = [];
        for await (let line of rl) {
            if (line.trim() != '' &&
                line.trimLeft().indexOf('/*') != 0 &&
                line.trimLeft().indexOf('*') != 0 &&
                line.trimLeft().indexOf('*/') != 0) {
                codeLines.push(line)
            }
        }
        let annotationGroup = [];
        let annotationMap = {};
        var beginIndex = 0;
        for (let line of codeLines) {
            line = line.trimLeft();
            //处理注解
            if (line.indexOf('//@') == 0) {
                var reg = /(Document|Filter)\((.+)\)/ig;
                let result = reg.exec(line);
                if (result) {
                    let annotation = `@${result[1]}:${result[2]}`;
                    if (!annotationGroup[beginIndex]) {
                        annotationGroup[beginIndex] = [annotation];
                    } else {
                        annotationGroup[beginIndex].push(annotation);
                    }
                }
            }
            //处理路由
            var reg = /^(\w+)\.(get|post|delete|head)\(['"]([\/\w]+)['"]/i;
            let ret = reg[Symbol.match](line);
            if (annotationGroup[beginIndex] && ret/*&& line.indexOf('router.') == 0*/) {
                let router = `${ret[2].toLowerCase()}:${ret[3]}`;
                annotationMap[router] = annotationGroup[beginIndex];
                ++beginIndex;
            }
        }
        await fn(annotationMap);
        return annotationMap;
    },
    _initAnnotation: function () {
        //对apidock注解进行处理
        core.use('/apidoc', async (req, res, next) => {
            let apiDoc = {};
            for (let k in annotationMap) {
                for (let v of annotationMap[k]) {
                    if (v.indexOf('@Document') == 0) {
                        let docContent = v.split(':')[1];
                        if (!apiDoc[k]) {
                            apiDoc[k] = [...docContent.split(',')];
                        } else {
                            apiDoc[k].push(...docContent.split(','));
                        }
                        if(apiDoc[k][3]&&apiDoc[k][4]){
                            let keyMeta=apiDoc[k][4];
                            let summary=apiDoc[k][3];
                            let apiInterfaces=document['summary'];
                            if(apiInterfaces&&apiInterfaces[summary]&&apiInterfaces[summary][keyMeta]){
                                let metaData=apiInterfaces[summary][keyMeta];
                                apiDoc[k].push(metaData);
                            }
                        }
                    }
                }
            }
            let ret={projectName:document.projectName||'',summary:apiDoc}
            res.send(ret);
        });
        //对注解进行拦截
        core.use(async (req, res, next) => {
            let path = req.path;
            let method = req.method.toLowerCase();
            let key = `${method}:${path}`
            if (annotationMap[key]) {
                for (let anno of annotationMap[key]) {
                    let annos = anno.split(':');
                    let annoType = annos[0];
                    let annoPrms = annos[1].split(',');
                    if (annoType.indexOf('@Filter') == 0) {
                        for (let anno of annoPrms) {
                            //执行注解路由
                            let annoFunc = filters[anno];
                            if (typeof annoFunc == 'function') {
                                if (!await annoFunc(req, res)) {
                                    colorlog.warning('Warning', `注解拦截:${key}:${anno}`);
                                    return;
                                } else {
                                    colorlog.success('DONE', `注解通过:${key}:${anno}`);
                                }
                            } else {
                                colorlog.warning('Error', `未定义路由注解:${key}:${anno}`);
                            }
                        }
                    }
                }
            }
            next();
        });
    },
    _initI18N: function (i18nPath, ext) {
        try {
            const locales = [];
            let files = fs.readdirSync(i18nPath);
            files.forEach(function (fileName, index) {
                if (fileName.lastIndexOf('.json') !== -1) {
                    let i18nName = (fileName.indexOf('.') == -1) ? fileName : fileName.split('.')[0];
                    locales.push(i18nName);
                }
            });
            if (locales) {
                var i18n = require('i18n');
                //config i18n support
                i18n.configure({
                    locales: locales,
                    defaultLocale: 'zh-CN',
                    directory: i18nPath,
                    updateFiles: false,
                    indent: "\t",
                    extension: ext,
                    logDebugFn: function (msg) {
                        //console.log('debug', msg);
                    },
                    logWarnFn: function (msg) {
                        // console.log('warn', msg);
                    },
                    logErrorFn: function (msg) {
                        //console.log('error', msg);
                    }
                });
                //use i18n middleware
                core.use(i18n.init);
                global.__ = (...args) => i18n.__(...args);
                global.__n = (...args) => i18n.__n(...args);
                global.__h = (...args) => i18n.__h(...args);
                global.__mf = (...args) => i18n.__mf(...args);
                global.L = (...args) => i18n.__(...args);
                global.setLocale = (local) => {
                    i18n.setLocale(local)
                };
                global.getLocale = () => i18n.getLocale(...arguments);
                global.getLocales = () => i18n.getCatalog();
            }
        } catch (ex) {
            console.error(ex.toString());
        }
    },
    _initModules: function (path) {
        if (!global.models) {
            global.models = {};
        }
        if (!this.modelRoot) {
            this.modelRoot = path;
        }
        if (typeof (global.M) == 'undefined') {
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
            core.use('/static', express.static(`${APP_ROOT}/static`));
        } else {
            global.config.staticConfig.forEach(function (item, index, array) {
                core.use(item.router, express.static(`${APP_ROOT}/${item.path}`, {index: item.index ? item.index : 'index.html'}));
            });
        }
    },
    _initRedis: function () {
        if (!global.config || !global.config.redisConfig || !global.config.redisConfig.host) {
            return;
        }
        let redisServerIp = global.config.redisConfig.host;
        let redisServerPort = (!global.config.redisConfig.port) ? 6379 : global.config.redisConfig.port;
        let redisServerDb = (!global.config.redisConfig.db) ? 0 : global.config.redisConfig.db;
        let redisServerPassword = (!global.config.redisConfig.password) ? '' : global.config.redisConfig.password;
        let opt = {
            socket:{
                host: redisServerIp,
                port: redisServerPort,
                keepAlive:3600,
                connectTimeout:5000,
                password:redisServerPassword,
                database:redisServerDb
            },
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
        let redis = require("redis");
        //create client
        let client = redis.createClient(opt);
        //socket close
        client.on('error', function (err) {
            colorlog.warning("Redis",err.message);
        });
        //redis reconnect
        client.on('reconnecting',()=>{
            colorlog.warning("Redis","Reconnect Redis Server!");
        });
        //redis connect
        client.on('connect', function () {
            colorlog.success("Redis","Connect Redis Server Success!");
        });
        client.connect();
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
            switch ((typeof (nsItem)).toLowerCase()) {
                case 'string': {
                    if (this.ns[nsItem] != undefined) {
                        let itemType = (typeof ($this.ns[nsItem])).toLowerCase();
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
        if (!global.config || !global.config.dbConfig || !global.config.dbConfig.dbtype) {
            return;
        }
        if (!global.config || !global.config.dbConfig || !global.config.dbConfig.dbname) {
            return;
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
            Sequelize.prototype.getPages = function (sql, currentPage, pageCount, retTotal, countFields = 1) {
                currentPage = (currentPage <= 0) ? 1 : currentPage;
                pageCount = (pageCount <= 0) ? 10 : pageCount;
                let $this = this;
                let begin = (currentPage - 1) * pageCount;
                return new Promise(function (resolve, reject) {
                    let countSql = sql.trim().toLowerCase().removeSubRight('limit').removeSubRight('order').replace(/(select\b)(.+)(\bfrom\b.+)(\bgroup\b.+)?(\border\b.+)?/ig, `$1 count(${countFields}) as \`count\` $3 $4`);
                    let querySql = sql + ' limit ' + begin.toString() + ',' + pageCount.toString();
                    let total = 0;
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
            var sequelize = new Sequelize(global.config.dbConfig.dbname, null, null, {
                //支持bigint issues
                //https://github.com/sequelize/sequelize/issues/1222
                timezone: '+08:00',
                logging: false,
                dialectOptions: (!global.config.dbConfig.dialectOptions) ? {} : global.config.dbConfig.dialectOptions,
                dialect: global.config.dbConfig.dbtype,
                replication: {
                    read: (!global.config.dbConfig.read) ? {} : global.config.dbConfig.read,
                    write: (!global.config.dbConfig.write) ? {} : global.config.dbConfig.write
                },
                pool: (!global.config.dbConfig.pool) ? {
                    maxConnections: 20,
                    min:5,
                    maxIdleTime: 30000
                } : global.config.dbConfig.pool,
            });

            //Test DB Connect
            sequelize.authenticate().then(function(e){
                colorlog.success('Database','Conntent To Database Success');
            }).catch(function (e){
                colorlog.warning('Database','Unable to connect to the database For Reason:'+ JSON.stringify(e.message));
            });
            //golbal database
            global.db = sequelize;
            global.DB=Sequelize;
            global.VModel= (tableName)=>new (require(`${APP_ROOT}/core/adapter/orm/mysql-base`)(global.db)(tableName));
        } catch (e) {
            console.error('db init error!....');
        }
    },
    _initTemplate: function () {
        let tplPath = path.join(__dirname, '../app/', (config.templateConfig && config.templateConfig.viewsPath) ? (config.templateConfig.viewsPath) : 'views');
        let useCache = (config.templateConfig && config.templateConfig.useCache) ? config.templateConfig.userCache : false;
        let viewEngine = (config.templateConfig && config.templateConfig.viewEngine) ? config.templateConfig.viewEngine : 'artTemplate';
        let defaultTplExt = (config.templateConfig && config.templateConfig.extName) ? config.templateConfig.extName : '.html';
        //set engine
        core.set('view engine', defaultTplExt);
        //view path
        core.set('views', tplPath);
        //view cache
        core.set('view cache',useCache);
        switch (viewEngine) {
            case 'artTemplate': {
                core.engine(defaultTplExt.replace(".", ""), require('express-art-template'));
                core.set('view options', {
                    base: '',
                    debug: true,
                    extname: defaultTplExt,
                    engine: defaultTplExt,
                    cache: useCache,
                    'encoding': 'utf8',
                });
                global.renderToHtml = (view, data) => {
                    let template = require('art-template');
                    let parseFile = path.join(process.cwd(), 'views', view + defaultTplExt)
                    let html = template(parseFile, data);
                    return html;
                };
                break;
            }
            default:{
                //adapter
                //https://github.com/tj/consolidate.js
                let templateAdapter=require(`${APP_ROOT}/core/adapter/tpl/express-common-template`);
                let view=templateAdapter(viewEngine);
                if(!view){
                    colorlog.warning('TemplateEngine','无法加载模板引擎'+viewEngine);
                    break;
                }
                //loda tpl engine
                core.engine(defaultTplExt.replace(".", ""),view );
                //renderToHtml
                global.renderToHtml=templateAdapter.renderToHtml;
            }
        }
    },
    _initApp: function (commonPath) {
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
        global.newSqlBuilder = function () {
            let sqlModel = Object.create(sqlbuilder);
            //存在bug 需要修复
            sqlModel.do = () => {
                let sql = sqlModel.sql().trimLeft();
                if (/^insert\b.*/i.test(sql)) {
                    return db.insert(sql);
                } else if (/^select.*/i.test(sql)) {
                    return db.select(sql);
                } else if (/^update.*/i.test(sql)) {
                    return db.update(sql);
                } else if (/^delete.*/i.test(sql)) {
                    return db.delete(sql);
                }
                return sqlModel.sql();
            }
            sqlModel.getPages = (currentPage, pageCount, retTotal, countFields = 1) => {
                return db.getPages(sqlModel.sql(), currentPage, pageCount, retTotal, countFields);
            };
            return sqlModel;
        }
        global.sqlBuilder = newSqlBuilder();
        global.co = require('co');
    },
    _initCommonFunc: function () {
        if (typeof (Object.values) !== 'function') {
            Object.values = function (obj) {
                var values = [];
                for (var key in obj) {
                    values.push(obj[key]);
                }
                return values;
            }
        }
        /**
         * 合并
         * @param targe
         * @param source
         */
        Object.merge = (targe, source) => {
            for (var k in source) {
                targe[k] = source[k];
            }
        }
        if (!Date.now) {
            Date.now = function now() {
                return new Date().getTime();
            };
        }
        String.prototype.format = function (args) {
            var result = this;
            if (arguments.length > 0) {
                if (arguments.length == 1 && typeof (args) == "object") {
                    for (var key in args) {
                        if (args[key] != undefined) {
                            var reg = new RegExp("({" + key + "})", "g");
                            result = result.replace(reg, args[key]);
                        }
                    }
                } else {
                    for (var i = 0; i < arguments.length; i++) {
                        if (arguments[i] != undefined) {
                            var reg = new RegExp("({)" + i + "(})", "g");
                            result = result.replace(reg, arguments[i]);
                        }
                    }
                }
            }
            return result;
        }
        var oldJsonParser = JSON.parse;
        JSON.parse = (jsonStr) => {
            try {
                return oldJsonParser(jsonStr);
            } catch (ex) {
                return null;
            }
        };
        /**
         * trimLeft
         * @returns {string}
         */
        String.prototype.trimLeft = function () {
            var i = 0;
            for (; i < this.length && this.charAt(i) == " "; i++) ;
            return this.substring(i, this.length);
        }
        /**
         * trimRight
         * @returns {string}
         */
        String.prototype.trimRigth = function trimRight() {
            var i = this.length - 1;
            for (; i > 0 && this.charAt(i) == " "; i--) ;
            return this.substring(0, ++i);
        }
        /**
         * remove right
         * @param str
         * @returns {*}
         */
        String.prototype.removeSubRight = function (str) {
            let rightIndex = this.indexOf(str);
            if (-1 == rightIndex) {
                return this;
            }
            return this.substr(0, rightIndex - 1);
        }

        /**
         * toUnicode
         * @returns {string}
         */
        String.prototype.toUnicode = function () {
            var ret = "";
            for (var i = 0; i < this.length; i++) {
                if (/[\u4e00-\u9fa5]/i.test(this[i])) {
                    ret += "\\u" + this.charCodeAt(i).toString(16);
                } else {
                    ret += this[i];
                }
            }
            return ret;
        }
        /**
         * isString
         * @returns {boolean}
         */
        String.isString = function (str) {
            return (typeof str == 'string') && str.constructor == String;
        }
        /**
         * 获取时间可读格式
         * @param hourOnly
         * @returns {string}
         */
        Date.prototype.toString = function (hourOnly = false) {
            if (!hourOnly) {
                return this.getFullYear()
                    + "-" + (this.getMonth() > 8 ? this.getMonth() + 1 : "0" + (this.getMonth()))
                    + "-" + (this.getDate() > 9 ? this.getDate() : "0" + this.getDate())
                    + " " + (this.getHours() > 9 ? this.getHours() : "0" + this.getHours())
                    + ":" + (this.getMinutes() > 9 ? this.getMinutes() : "0" + this.getMinutes())
                    + ":" + (this.getSeconds() > 9 ? this.getSeconds() : "0" + this.getSeconds());
            } else {
                return (this.getHours() > 9 ? this.getHours() : "0" + this.getHours())
                    + ":" + (this.getMinutes() > 9 ? this.getMinutes() : "0" + this.getMinutes())
                    + ":" + (this.getSeconds() > 9 ? this.getSeconds() : "0" + this.getSeconds());
            }
        }
        /**
         * format
         * @param fmt
         * @returns {*}
         * @constructor
         */
        Date.prototype.format = function (fmt) {
            var o = {
                "M+": this.getMonth() + 1, //月份
                "d+": this.getDate(), //日
                "h+": this.getHours(), //小时
                "m+": this.getMinutes(), //分
                "s+": this.getSeconds(), //秒
                "q+": Math.floor((this.getMonth() + 3) / 3), //季度
                "S": this.getMilliseconds() //毫秒
            };
            if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        }
        /**
         * strtotime
         * @param str
         * @returns {number}
         */
        Date.strtotime = (str) => {
            var arr = str.split(' ');
            var day = arr[0].split('-');
            arr[1] = (arr[1] == null) ? '0:0:0' : arr[1];
            var time = arr[1].split(':');
            for (var i = 0; i < day.length; i++) {
                day[i] = isNaN(parseInt(day[i])) ? 0 : parseInt(day[i]);
            }
            for (var i = 0; i < time.length; i++) {
                time[i] = isNaN(parseInt(time[i])) ? 0 : parseInt(time[i]);
            }
            return ((new Date(day[0], day[1] - 1, day[2], time[0], time[1], time[2])).getTime()) / 1000;
        }
        /**
         *
         * @returns {number}
         */
        Date.time = () => {
            return parseInt(Date.now() / 1000);
        }
        /**
         *
         * @constructor
         */
        Date.EarlyMorningTime = () => {
            let date = new Date();
            let ret = parseInt(Date.parse(date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()) / 1000);
            return ret;
        }
        /**
         * js数组合并去重
         * @returns {Array}
         */
        Array.prototype.unique = function () {
            let m = {};
            for (let v of this) {
                m[v] = true;
            }
            return Object.keys(m);
        };
        /**
         * inArray
         * @param val
         * @returns {boolean}
         */
        Array.prototype.inArray = function (val) {
            for (let v of this) {
                if (v == val) {
                    return true;
                }
            }
            return false;
        }

        //define constraint
        global.defineConstraint = (obj, k, v) => {
            obj.__defineGetter__(k, () => v);
        };
        global.nowTs = global.time = () => Math.round(Date.now() / 1000);
        global.isArray = (o) => {
            return Object.prototype.toString.call(o) === `[object Array]`;
        }
        global.isString = (str) => (typeof str == 'string') && str.constructor == String;
        global.deepClone = (o) => {
            var t = o instanceof Array ? [] : {};
            for (var f in o) {
                t[f] = typeof o[f] === 'object' ? deepClone(o[f]) : o[f];
            }
            return t;
        };
        global.isTrueObject = obj => Array.isArray(obj) ? Boolean(obj.length) : Boolean(obj);
        global.isFalseObject = obj => (!(Array.isArray(obj) ? Boolean(obj.length) : Boolean(obj)));
        global.t = (obj) => Object.prototype.toString.call(obj);
        global.format = global.sprintf = require('util').format;
        global.filterValue = (val, defaultvalue) => (typeof (val) == 'undefined' || !val) ? defaultvalue : val;
        global.return = (ret, data, msg) => ({ret: ret, data: data, msg: msg})
        global.error = (data, msg) => ({status: 0, data: data, info: msg});
        global.success = (data, msg) => ({status: 1, data: data, info: msg});
    },
    _initMiddleWare: function () {
        if (config.middleWare && config.middleWare.length) {
            for (let middleWare of config.middleWare) {
                core.use(require(`${APP_PATH}middleware/${middleWare}`));
            }
        }
        global.mw = {
            crosser: (allowOrigin, allowHeader, allowMethod, allowCredential) => {
                return (req, res, next) => {
                    res.header("Access-Control-Allow-Credentials", allowCredential || "true");
                    res.header("Access-Control-Allow-Headers", allowHeader || "*");
                    res.header("Access-Control-Allow-Origin", allowOrigin || req.headers.origin || "*");
                    res.header("Access-Control-Allow-Methods", allowMethod || "POST, GET");
                    res.header("X-Powered-By", 'CrossDomainAllower');
                    next();
                };
            },
            /*
            *csrf protection middleware
            *core.get('/form', csrfProtection, function (req, res) {
            *  // pass the csrfToken to the view
            *  res.render('send', { csrfToken: req.csrfToken() })
            *})
            *
            *<form action="/process" method="POST">*
            *   <input type="hidden" name="_csrf" value="{{csrfToken}}">
            *   Favorite color: <input type="text" name="favoriteColor">
            *   <button type="submit">Submit</button>
            * </form>
            */
            csrfProtection: () => {
                let csrf = require('csurf');
                return csrf({cookie: true});
            }
        };
    },
    _initProcess: function () {
        //防止进程退出
        process.on('uncaughtException', (err) => {
            console.log(err.message);
        });
    }
}).init();

//debug 生产环境直接注释
core.use(logger('dev'));

//捕获404状态码
core.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

//处理异常
process.on('unhandledRejection', (reason, p) => {
    console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason);
});

//错误处理
core.use(function (err, req, res, next) {
    //在开发环境下提供错误处理
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.send('server error:' + err.message);
});


module.exports = core;