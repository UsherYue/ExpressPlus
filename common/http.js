/**
 * ApiBareFramework
 *  Created by usher.yue.
 * User: usher.yue
 * Date: 17/1/24
 * Time: 18:25
 * 心怀教育梦－烟台网格软件技术有限公司
 */

"use strict";

var request = require('request');

var _toJson = (str) => JSON.parse(str);

module.exports = {
    post: (url, params, decode) => {
        return new Promise((resolve, reject) => {
            request.post({url: url, form: params}, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    resolve(decode === true ? _toJson(body) : body);
                } else {
                    resolve(false);
                }
            });
        });
    },
    get: (url, decode) => {
        return new Promise((resolve, reject) => {
            request(url, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    resolve(decode === true ? _toJson(body) : body);
                } else {
                    resolve(false)
                }
            })
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
            request({url: url, method: 'OPTIONS'}, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    resolve(decode === true ? _toJson(body) : body);
                } else {
                    resolve(false)
                }
            })
        });
    },
    getClientIp:(req)=>{
        let ip=req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
        if (ip.substr(0, 7) == "::ffff:") {
            ip = ip.substr(7);
            return ip;
        }
    }
};
