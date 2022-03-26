#!/usr/bin/env node

/**
 * WebStorm
 * Helper.php Created by usher.yue.
 * User: usher.yue
 * Date: 17/1/8
 * Time: 下午5:27
 * www+electron启动入口,切记安装electron
 */
'use strict';

const http = require('http');
const https = require('https');
const path = require('path');
const cluster = require('cluster');
const fs = require('fs');

///////////进程启动控制状态/////////////////
/**
 * 主页面入口地址
 * @type {string}
 */
global.ELECTRON_MAIN_URL='http://newk12.12xue.com/';
/**
 * Electron root
 * @type {string}
 */
global.ELECTRON_ROOT=path.join(__dirname, 'electron/');
/**
 * 主窗口preload位置
 * @type {string}
 */
global.ELECTRON_MAIN_PRELOAD=path.join(ELECTRON_ROOT, 'preload-main.js');
/**
 * true开启集群多核
 * false 启动单核用于开发
 * @type {boolean}
 */
global.USE_CLUSTER = false;
/**
 * app path
 * @type {string}
 */
global.APP_PATH = `${__dirname}/app/`;
/**
 * 项目目录
 * @type {string}
 */
global.APP_ROOT = __dirname;
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
global.CORE_PATH = `${__dirname}/core/core`;
/**
 * process name
 * @type {string}
 */
global.PROCESS_NAME = 'WWW-ELECTRON';
///////////////加载模块/////////////////////
global.config = require(APP_CONFIG);
global.config.nsConfig = require(NS_CONFIG);
const app = require(CORE_PATH);
//////////////////读取配置选项////////////////////
const httpPort = normalizePort(process.env.HTTP_PORT || global.config.httpConfig.httpPort) || 0;
const httpsPort = normalizePort(process.env.HTTPS_PORT || global.config.httpConfig.httpsPort) || 0;
//run service
if (cluster.isMaster) {
    var workersNum = 1;
    colorlog.info('Master', `Run ${PROCESS_NAME} Master Process ,PID:` + process.pid);
    // Fork workers.
    if (USE_CLUSTER) {
        workersNum = require('os').cpus().length
    }
    for (let i = 0; i < workersNum; i++) {
        cluster.fork();
    }
    cluster.on('listening', function (worker, address) {
        colorlog.info('Worker', 'PID:' + worker.process.pid + ',Listen Port:' + address.port);
    });
    cluster.on('exit', function (worker, code, signal) {
        colorlog.warning('Error', 'Worker ' + worker.process.pid + ' Exited');
        cluster.fork();
    });
    process.title = `${PROCESS_NAME} Master  Process `;
} else {
    //http server port
    if (httpPort) {
        const httpServer = http.createServer(app);
        httpServer.listen(httpPort);
        httpServer.on('error', onError);
        httpServer.on('listening', onListening);
    }
    //http servers port
    if (httpsPort) {
        const options = {
            key: fs.readFileSync(`${APP_PATH}cert/${config.httpConfig.cert.key}`),
            cert: fs.readFileSync(`${APP_PATH}cert/${config.httpConfig.cert.cert}`)
        };
        const httpsServer = https.createServer(options, app);
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
            colorlog.warning('Error', error.port + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            colorlog.warning('Error', error.port + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }

}


if (cluster.isMaster) {

    const {app: winApp, BrowserWindow} = require('electron');
    //global win
    let win=null;
    /**
     * 集群master消息
     */
    cluster.on('message',  (worker, message, handle) => {
          let task=message.task;
          //加载
          win&&(win.loadURL(ELECTRON_MAIN_URL));
    });

    /**
     * 创建窗口
     */
    function createWindow() {
         win = new BrowserWindow({
            width: 1000,
            height: 830,
            maxWidth: 700,
            maxHeight: 530,
            maximizable: false,
            frame:false,
            webPreferences: {
                preload:ELECTRON_MAIN_PRELOAD ,
                navigateOnDragDrop: true, //拖拽图片打开新窗口
                nodeIntegration: true,  //注入node渲染进程
                contextIsolation: false,  //上下文隔离 可以使用node
            }
        });
    };

    //app准备完善
    winApp.whenReady().then(() => {
        //创建窗口
        createWindow();
        //mac下active创建窗口
        winApp.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindow()
            }
        });
        //mac下窗口关闭
        winApp.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                winApp.quit()
            }
        })
    })
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    let debug = require('debug')('debugserver');
    httpPort && debug('Express Listening on ' + httpPort);
    httpsPort && debug('Express Listening on ' + httpsPort);
    //load main in worder when http server is run
    process.send({task:"load-mainwin"});
}
