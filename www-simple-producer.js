#!/usr/bin/env node

/**
 * WebStorm
 * Helper.php Created by usher.yue.
 * User: usher.yue
 * Date: 17/1/8
 * Time: 下午5:27
 * www启动入口
 */
'use strict';

const http = require('http');
const https = require('https');
const path = require('path');
const cluster = require('cluster');
const fs=require('fs');

///////////进程启动控制状态/////////////////
/**
 * true开启集群多核
 * false 启动单核用于开发
 * @type {boolean}
 */
global.USE_CLUSTER  =  false ;
/**
 * app path
 * @type {string}
 */
global.APP_PATH = `${__dirname}/app/`;
/**
 * 项目目录
 * @type {string}
 */
global.APP_ROOT=__dirname;
/**
 * 名字空间配置文件
 * @type {string}
 */
global.NS_CONFIG = `${APP_PATH}conf/ns`;
/**
 * 应用全局配置文件
 * @type {string}
 */
global.APP_CONFIG = `${APP_PATH}conf/config`;
/**
 * core入口禁止修改
 * @type {string}
 */
global.CORE_PATH= `${__dirname}/core/core`;
/**
 * process name
 * @type {string}
 */
global.PROCESS_NAME='ExpressPlus';
///////////////加载模块/////////////////////
global.config = require(APP_CONFIG);
global.config.nsConfig = require(NS_CONFIG);
const app = require(CORE_PATH);
//////////////////读取配置选项////////////////////
const httpPort = normalizePort(process.env.HTTP_PORT || global.config.httpConfig.httpPort)||0;
const httpsPort = normalizePort(process.env.HTTPS_PORT || global.config.httpConfig.httpsPort)||0;


/*
 * Description:生产者
 * User: usher.yue
 * Date: 2022/05/20
 * Time: 21:48
 */
app.get('/pushtask',async(req,res,next)=>{
    ///consumer
    // const subscriber = redis.duplicate();
    // await subscriber.connect();
    // await subscriber.subscribe('task', (message) => {
    //     console.log(message); // 'message'
    // });
    /////send task to redis ////
    let task=req.query.channel||'task';
    let message=req.query.message||'';
    await redis.publish(task,message);
    res.send('ok')
});


//run service
if (cluster.isMaster) {
    var workersNum = 1;
    colorlog.info('Master',"Run ExpressPlus Master Process ,PID:"+process.pid);
    // Fork workers.
    if(USE_CLUSTER){
        workersNum=require('os').cpus().length
    }
    for (let i = 0; i < workersNum; i++) {
        cluster.fork();
    }
    cluster.on('listening', function (worker, address) {
        colorlog.info('Worker','PID:'+worker.process.pid+',Listen Port:' + address.port);
    });
    cluster.on('exit', function (worker, code, signal) {
        colorlog.warning('Error','Worker ' + worker.process.pid + ' Exited');
        cluster.fork();
    });
    process.title = `${PROCESS_NAME} Master  Process `;
} else {
    //http server port
    if(httpPort){
        const httpServer = http.createServer(app);
        httpServer.listen(httpPort);
        httpServer.on('error', onError);
        httpServer.on('listening', onListening);
    }
    //http servers port
    if(httpsPort){
        const options = {
            key: fs.readFileSync(`${APP_PATH}cert/${config.httpConfig.cert.key}`),
            cert: fs.readFileSync(`${APP_PATH}cert/${config.httpConfig.cert.cert}`)
        };
        const httpsServer = https.createServer(options,app);
        httpsServer.listen(httpsPort);
        httpsServer.on('error', onError);
        httpsServer.on('listening', onListening);
    }
    //script file
    const scriptName = path.parse(__filename).name;
    process.title = `${PROCESS_NAME} Worker  Process ${scriptName}`;
}




/**
 * port convert
 * @param val
 * @returns {*}
 */
function normalizePort(val) {
    var port = parseInt(val, 10);
    if (isNaN(port)) {
        return val;
    }
    if (port >= 0) {
        return port;
    }
    return false;
}

/**
 *
 * @param error
 */
function onError(error) {
    switch (error.code) {
        case 'EACCES':
            colorlog.warning('Error',error.port + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            colorlog.warning('Error',error.port  + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }

}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    let debug = require('debug')('debugserver');
    httpPort&&debug('Express Listening on ' + httpPort);
    httpsPort&&debug('Express Listening on ' + httpsPort);
}




