/**
 * ExpressPlus
 * jwt.js Created by usher.yue.
 * User: usher.yue
 * Date: 2022/2/22
 * Time: 14:21
 * 乘风破浪－JSON Web Token
 */
const jwt = require("jsonwebtoken"); // 引入jwt

//jwt 密钥
const jwtSecret = config.jwt ? (config.jwt.secret ? config.jwt.secret : '') : '';


module.exports = class {

    /**
     * 签名
     * @param data
     * @param expiresIn 单独一个数字表示多少秒 10h表示10小时后过期 2d表示2天后过期
     * @param sign
     */
    static sign(data = {}, expiresIn = '1h', secret = jwtSecret) {
        if (!expiresIn || !secret) {
            return false;
        }
        const token = jwt.sign(data, secret, {
            expiresIn: expiresIn,
        });
        return {token: token};
    }

    /**
     * 校验token
     * @param token
     * @param secret
     * @returns {Promise<unknown>}
     */
    static verify(token = '', secret = jwtSecret) {
        return new Promise((resolve, reject) => {
            if (!secret) {
                return resolve(false);
            }
            jwt.verify(token, secret, (err, decoded) => {
                if (err) {
                    resolve(false);
                } else {
                    resolve(decoded);
                }
            });
        });
    }

    /**
     * unit_test
     */
    static echo() {
        console.log('echo!');
    }
};

