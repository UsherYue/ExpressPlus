/**
 *  Created by usher.yue.
 * User: usher.yue
 * Date: 17/3/23
 * Time: 16:18
 */

"use strict";

const crypto = require('crypto');
const {Buffer} = require('buffer');

module.exports = {
    /**
     * md5
     * @param str
     * @param encoding
     * @returns {string}
     */
    md5: (str,encoding='hex') => crypto.createHash('md5').update(str).digest(encoding),
    /**
     * md5LowerCase
     * @param str
     * @returns {string}
     */
    md5LowerCase: str => this.md5(str).toLowerCase(),
    /**
     * md5UpperCase
     * @param str
     * @returns {string}
     */
    md5UpperCase: str => this.md5(str).toUpperCase(),
    /**
     * base64Encode
     * @param str
     * @returns {string}
     */
    base64Encode: str => Buffer.from(str).toString('base64'),
    /**
     * base64Decode
     * @param str
     * @returns {string}
     */
    base64Decode: str =>  Buffer.from(str,'base64').toString(),
    /**
     * getCiphers
     * @returns {string[]}
     */
    getCiphers:()=> crypto.getCiphers(),
    /**
     * hash
     * @param str
     * @param algo
     * @param encoding
     * @returns {string}
     */
    hash:(str,algo='sha256',encoding='hex')=>{
        return crypto.createHash(algo).update(str).digest(encoding);
    },
    /**
     * hmac
     * @param str
     * @param key
     * @param algo
     * @param encoding
     * @returns {string}
     */
    hmac:(str,key,algo='sha256',encoding='hex')=>{
        return crypto.createHmac('sha256', key).update(str).digest(encoding);
    },
    /**
     * rsaSign
     * @param key
     * @param data
     * @param encode
     * @returns {string}
     */
    rsaSign: (key, data,encode='hex') => {
        const sign = crypto.createSign('RSA-SHA256');
        sign.update(data);
        let sig = sign.sign(key, encode||'hex');
        return sig;
    },
    /**
     * rsaVerify
     * @param pubKey
     * @param sig
     * @param data
     * @param encode
     * @returns {boolean}
     */
    rsaVerify: (pubKey, sig, data,encode) => {
        const verify = crypto.createVerify('RSA-SHA256');
        verify.update(data);
        return verify.verify(pubKey, sig, encode||'hex');
    },
    /**
     * aes-128-cbc 对应16字节key iv
     * @param key
     * @param iv
     * @param data
     * @param paddingMode
     * @returns {string}
     */
    aesEncrypt: function (key, iv, data,paddingMode='aes-128-cbc') {
        const cipher = crypto.createCipheriv(paddingMode, key, iv);
        let crypted = cipher.update(data, 'utf8', 'binary');
        crypted += cipher.final('binary');
        crypted = Buffer.from(crypted, 'binary').toString('base64');
        return crypted;
    },
    /**
     *aes-128-cbc 对应16字节key iv
     * @param key
     * @param iv
     * @param crypted
     * @param paddingMode
     * @returns {string}
     */
    aesDecrypt: function (key, iv, crypted,paddingMode='aes-128-cbc') {
        crypted = Buffer.from(crypted, 'base64').toString('binary');
        const decipher = crypto.createDecipheriv(paddingMode, key, iv);
        let decoded = decipher.update(crypted, 'binary', 'utf8');
        decoded += decipher.final('utf8');
        return decoded;
    },
    /**
     * des-ecb  对应8字节KEY  IV
     * @param key
     * @param rawText
     * @param iv
     * @param paddingMode
     * @returns {string}
     */
    desEncrypt:function (key, rawText,iv='',paddingMode='des-ecb'){
        const cipher = crypto.createCipheriv(paddingMode, key,  Buffer.from(iv));
        cipher.setAutoPadding(true);
        let crypted = cipher.update(rawText, 'utf8', 'hex');
        crypted += cipher.final('hex');
        return crypted;
    },
    /**
     * des-ecb  对应8字节KEY  IV
     * @param key
     * @param encryptText
     * @param iv
     * @param paddingMode
     * @returns {string}
     */
    desDecrypt:function (key, encryptText,iv='',paddingMode='des-ecb'){
        const cipher = crypto.createDecipheriv(paddingMode, key, Buffer.from(iv));
        cipher.setAutoPadding(true);
        let decrypted = cipher.update(encryptText, 'hex', 'utf8');
        decrypted += cipher.final('utf8');
        return decrypted;
    },
};