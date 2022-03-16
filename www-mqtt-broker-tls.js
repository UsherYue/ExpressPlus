#!/usr/bin/env node

/**
 * WebStorm
 * Helper.php Created by usher.yue.
 * User: usher.yue
 * Date: 17/1/8
 * Time: 下午5:27
 * mqtt-server-tls启动入口
 */
'use strict';

const http = require('http');
const https = require('https');
const path = require('path');
const cluster = require('cluster');
const fs=require('fs');
const aedes = require('aedes')();



///////////进程启动控制状态/////////////////
/**
 * MQTT TLS  CERT CONFIG
 * @type {{PUBLIC_CERT_FILE: string, PRIVATE_KEY_FILE: string}}
 */
global.MQTT_TLS_OPTIONS={
    PRIVATE_KEY_FILE:`./app/cert/key.pem`,
    PUBLIC_CERT_FILE:`./app/cert/cert.pem`
};
/**
 * mqtt server监听服务
 * @type {number}
 */
global.MQTT_TLS_PORT=33301;
/**
 * true开启集群多核
 * false 启动单核用于开发
 * @type {boolean}
 */
global.USE_CLUSTER  =  true ;
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
global.PROCESS_NAME='WWW-MQTT';
///////////////加载模块/////////////////////
global.config = require(APP_CONFIG);
global.config.nsConfig = require(NS_CONFIG);
const app = require(CORE_PATH);
//////////////////读取配置选项////////////////////
const httpPort = normalizePort(process.env.HTTP_PORT || global.config.httpConfig.httpPort)||0;
const httpsPort = normalizePort(process.env.HTTPS_PORT || global.config.httpConfig.httpsPort)||0;
//run service
if (cluster.isMaster) {
    var workersNum = 1;
    colorlog.info('Master',`Run ${PROCESS_NAME} Master Process ,PID:`+process.pid);
    // Fork workers.
    if(USE_CLUSTER){
        workersNum=require('os').cpus().length
    }
    for (let i = 0; i < workersNum; i++) {
        cluster.fork();
    }
    cluster.on('listening', function (worker, address) {
        if( address.port==MQTT_TLS_PORT){
            colorlog.info('Worker','PID:'+worker.process.pid+',mqtt tls Listen Port:' + address.port);
        }else{
            colorlog.info('Worker','PID:'+worker.process.pid+',http(s) Listen Port:' + address.port);
        }
    });
    cluster.on('exit', function (worker, code, signal) {
        colorlog.warning('Error','Worker ' + worker.process.pid + ' Exited');
        cluster.fork();
    });
    process.title = `${PROCESS_NAME} Master  Process `;
} else {
    //http server port
    if(httpPort){
        //HTTP协议监听
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
    //tls
    const options = {
        key: fs.readFileSync(MQTT_TLS_OPTIONS.PRIVATE_KEY_FILE),
        cert: fs.readFileSync(MQTT_TLS_OPTIONS.PUBLIC_CERT_FILE)
    }
    const mqttServer = require('tls').createServer(options,aedes.handle);
    //MQTT协议监听
    mqttServer.listen(MQTT_TLS_PORT, function () {
         // console.log('MQTT Listen Portt:', MQTT_PORT)
    });
    //////////MQTT协议->HTTP路由开发业务更简单//////////

    ////////////MQTT协议也可以直接调用Model进行业务编写//////////
    //https://github.com/UsherYue/aedes/blob/main/examples/clusters/index.js

    //////////MQTT协议 转 HTTP//////////
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




