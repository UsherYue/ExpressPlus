/**
 *  Created by usher.yue.
 * User: usher.yue
 * Date: 17/3/23
 * Time: 16:18
 */

"use strict";

var crypto = require('crypto');
var Buffer = require('buffer').Buffer

module.exports = {
    md5: str => {
        let hasher = crypto.createHash('md5');
        hasher.update(str);
        return hasher.digest('hex').toUpperCase();
    },
    md5LowerCase: str => {
        let hasher = crypto.createHash('md5');
        hasher.update(str);
        return hasher.digest('hex');
    },
    base64Encode: str => Buffer.from(str).toString('base64'),
    base64Decode: str => new Buffer(str,'base64').toString(),
    hash:(str,algo='sha256',encoding='hex')=>{
        return crypto.createHash(algo).update(str).digest(encoding);
    },
    hmac:(str,key,algo='sha256',encoding='hex')=>{
        return crypto.createHmac('sha256', key).update(str).digest(encoding);
    },
    rsaSign: (key, data,encode) => {
        var sign = crypto.createSign('RSA-SHA256');
        sign.update(data);
        var sig = sign.sign(key, encode||'hex');
        return sig;
    },
    rsaVerify: (pubKey, sig, data,encode) => {
        var verify = crypto.createVerify('RSA-SHA256');
        verify.update(data);
        return verify.verify(pubKey, sig, encode||'hex');
    },
    desEncrypt: function (key, rawText) {
        var keyBuf = new Buffer(key);
        var cipher = crypto.createCipheriv('des-ecb', keyBuf, new Buffer(0));
        cipher.setAutoPadding(true)
        var ret = cipher.update(rawText, 'utf8', 'base64');
        ret += cipher.final('base64');
        return ret;
    },
    desDecrypt: function (key, encryptText) {
        var keyBuf = new Buffer(key);
        var decipher = crypto.createDecipheriv('des-ecb', keyBuf,new Buffer(0));
        decipher.setAutoPadding(true);
        var ret = decipher.update(encryptText, 'base64', 'utf8');
        ret += decipher.final('utf8');
        return ret;
    }

};