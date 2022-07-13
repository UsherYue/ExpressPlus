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
                var reg = /(Document|Filter|Event)\((.+)\)/ig;
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
                        //fill meta data
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
            let ret = {projectName: document.projectName || '', summary: apiDoc}
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
                    } else if (annoType.indexOf('@Event') == 0) {
                        for (let anno of annoPrms) {
                            //执行注解路由
                            let annoFunc = events[anno];
                            if (typeof annoFunc == 'function') {
                                await annoFunc(req, res)
                                colorlog.success('DONE', `触发事件:${key}:${anno}`);
                            } else {
                                colorlog.warning('Error', `未定义事件:${key}:${anno}`);
                            }
                        }
                    }
                }
            }
            next();
        });
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
    _initI18N: function (i18nPath, ext) {
        require('./lib/_initI18N')(core,i18nPath, ext);
    },
    _initStatic: function () {
        require('./lib/_initStaic')(core,express);
    },
    _initRedis: function () {
        require('./lib/_initRedis');
    },
    _initDb: function ($this) {
        require('./lib/_initDb');
    },
    _initTemplate: function () {
        require('./lib/_initTemplate')(core);
    },
    _initApp: function (commonPath) {
        require('./lib/_initApp')(commonPath,express);
    },
    _initCommonFunc: function () {
        require('./lib/_commFunc');
    },
    _initMiddleWare: function () {
        require('./lib/_middleWare');
    },
    _initProcess: function () {
        require('./lib/_initProcess');
    }
}).init();


//debug 生产环境直接注释
//core.use(logger('dev'));



//错误处理
core.use(function (err, req, res, next) {
    //在开发环境下提供错误处理
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.send('server error:' + err.message);
});


module.exports = core;