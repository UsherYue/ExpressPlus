/**
 * ApiBareFramework
 *  Created by usher.yue.
 * User: usher.yue
 * Date: 17/1/24
 * Time: 18:25
 */

"use strict";
//设置emmiter不限制
require('events').EventEmitter.defaultMaxListeners = 6553500;


var request = require('request');
JSON.parse=require('json-bigint').parse;

const MAX_TIMEOUT = 30000;

var _toJson = (str) => JSON.parse(str);

module.exports = {
    post: (url, params, decode) => {
        return new Promise((resolve, reject) => {
            request.post({url: url, form: params, timeout: MAX_TIMEOUT}, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    resolve(decode === true ? _toJson(body) : body);
                } else {
                    resolve(false);
                }
            });
        });
    },
    post_v2: (url, params, decode, header = {}, body = '', ca = {}) => {
        let opts = {
            timeout: MAX_TIMEOUT,
            url: url,
            headers: header
        };
        if (body) {
            opts.body = body;
        } else {
            opts.form = params;
        }
        //config ca
        opts = Object.assign(opts, ca);
        return new Promise((resolve, reject) => {
            request.post(opts, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    resolve(decode === true ? _toJson(body) : body);
                } else {
                    //console.log(error)
                    resolve(false);
                }
            });
        });
    },
    /**
     * post json
     * @param url
     * @param param
     * @param decode
     * @param header
     * @returns {Promise}
     */
    postJson:(url,param,decode=false,header={})=>{
        let opts={
            timeout: 5000,
            url: url,
            headers: Object.assign({'content-type':'application/json'},header)
        };
        opts.body=typeof param=='string'?param:JSON.stringify(param);
        return new Promise((resolve, reject) => {
            request.post(opts, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    resolve(decode === true ? _toJson(body) : body);
                } else {
                    resolve(false);
                }
            });
        });
    },
    /**
     * 通过代理访问
     * @param url
     * @param decode
     * @param proxy
     */
    getByProxy: (targetUrl, proxyUrl, decode) => {
        return new Promise((resolve, reject) => {
            const request = require("request");
            const proxiedRequest = request.defaults({'proxy': proxyUrl});
            const options = {
                url: targetUrl,
                timeout: MAX_TIMEOUT
            };
            proxiedRequest
                .get(options, function (err, res, body) {
                    if (res.statusCode != 200) {
                        resolve(null);
                    } else {
                        resolve(decode === true ? _toJson(body) : body);
                    }
                })
                .on("error", function (err) {
                    resolve(null);
                });
        });
    },
    get: (url, decode) => {
        return new Promise((resolve, reject) => {
            request.get({url: url, maxRedirects: 100, timeout: MAX_TIMEOUT}, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    resolve(decode === true ? _toJson(body) : body);
                } else {
                    resolve(false)
                }
            })
        });
    },
    getGbk: (url, decode) => {
        return new Promise((resolve, reject) => {
            var http = require('https'),
                Iconv = require('iconv').Iconv;
            var data = '';
            http.get(url, function (res) {
                res.setEncoding('binary');
                res.on('data', function (chunk) {
                    data += chunk;
                });
                res.on('end', function () {
                    var decodedBody = new Iconv('GBK', 'UTF-8').convert(new Buffer(data, 'binary')).toString();
                    resolve(decode === true ? _toJson(decodedBody) : decodedBody);
                });
            });
        });
    },
    getGbkNoSsl: (url, decode) => {
        return new Promise((resolve, reject) => {
            var http = require('app/common/http'),
                Iconv = require('iconv').Iconv;
            var data = '';
            http.get(url, function (res) {
                res.setEncoding('binary');
                res.on('data', function (chunk) {
                    data += chunk;
                });
                res.on('end', function () {
                    var decodedBody = new Iconv('GBK', 'UTF-8').convert(new Buffer(data, 'binary')).toString();
                    resolve(decode === true ? _toJson(decodedBody) : decodedBody);
                });
            });
        });
    },
    put: (url, params, decode) => {
        return new Promise((resolve, reject) => {
            request.put({url: url, form: params}, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    resolve(decode === true ? _toJson(body) : body);
                } else {
                    resolve(false);
                }
            });
        });
    },
    delete: (url, param, decode) => {
        return new Promise((resolve, reject) => {
            request.delete(url, param, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    resolve(decode === true ? _toJson(body) : body);
                } else {
                    resolve(false)
                }
            })
        });
    },
    head: (url, decode) => {
        return new Promise((resolve, reject) => {
            request.head(url, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    resolve(decode === true ? _toJson(body) : body);
                } else {
                    resolve(false)
                }
            })
        });
    },
    options: (url, decode) => {
        return new Promise((resolve, reject) => {
            var bufferHelper = new BufferHelper();
            request({url: url, method: 'OPTIONS'}, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    resolve(decode === true ? _toJson(body) : body);
                } else {
                    resolve(false)
                }
            })
        });
    },
    /**
     * 文件不存在的情况后期有时间再写吧~~~
     * @param url
     * @param saveFilename
     * @returns {Promise}
     */
    downloadFile: (url, saveFilename) => {
        return new Promise(function (resolve, reject) {
            var fs = require('fs');
            request({url: url, timeout: 10 * 60 * 1000}).pipe(fs.createWriteStream(saveFilename)).on('close', (r) => {
                resolve(true);
            }).on('error', (r) => {
                resolve(false)
            });
        });
    },
    getClientIp: (req) => {
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
        if (ip.substr(0, 7) == "::ffff:") {
            ip = ip.substr(7);
            return ip;
        }
    }
};
