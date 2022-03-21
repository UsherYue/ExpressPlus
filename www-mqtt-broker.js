#!/usr/bin/env node

/**
 * WebStorm
 * Helper.php Created by usher.yue.
 * User: usher.yue
 * Date: 17/1/8
 * Time: 下午5:27
 * mqtt-server启动入口
 */
'use strict';

const http = require('http');
const https = require('https');
const path = require('path');
const cluster = require('cluster');
const fs=require('fs');
const aedes = require('aedes')();
const mqttServer = require('net').createServer(aedes.handle);


///////////进程启动控制状态/////////////////
/**
 * mqtt server监听服务
 * @type {number}
 */
global.MQTT_PORT=33301;
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
        if( address.port==MQTT_PORT){
            colorlog.info('Worker','PID:'+worker.process.pid+',mqtt Listen Port:' + address.port);
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
    //MQTT协议监听
    mqttServer.listen(MQTT_PORT, function () {
         // console.log('MQTT Listen Portt:', MQTT_PORT)
    });

    /**
     * mqtt auth
     * @param client
     * @param username
     * @param password
     * @param callback
     */
    aedes.authenticate = function (client, username, password, callback) {
        callback(null, username === 'admin' && password=='admin');
    }

    /**
     * 客户端连接
     */
    aedes.on('client', function (client) {
        console.log('Client Connected: \x1b[33m' + (client ? client.id : client) + '\x1b[0m', 'to broker', aedes.id)
    });

    /**
     * 订阅
     */
    aedes.on('subscribe', function (subscriptions, client) {
        // console.log('MQTT client \x1b[32m' + (client ? client.id : client) +
        //     '\x1b[0m subscribed to topics: ' + subscriptions.map(s => s.topic).join('\n'), 'from broker', aedes.id)
    });
    /**
     * when message is publish
     */
    aedes.on('publish', async function (packet, client) {
        // console.log('Client \x1b[31m' + (client ? client.id : 'BROKER_' + aedes.id) + '\x1b[0m has published', packet.payload.toString(), 'on', packet.topic, 'to broker', aedes.id)
    });

    /**
     * 取消订阅消息
     */
    aedes.on('unsubscribe', function (subscriptions, client) {
        // console.log('MQTT client \x1b[32m' + (client ? client.id : client) +
        // '\x1b[0m unsubscribed to topics: ' + subscriptions.join('\n'), 'from broker', aedes.id)
    });

    /**
     * 客户端取消链接
     */
    aedes.on('clientDisconnect', function (client) {
        // console.log('Client Disconnected: \x1b[31m' + (client ? client.id : client) + '\x1b[0m', 'to broker', aedes.id)
    })
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




