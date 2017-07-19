/**
 * 12XueSSO
 *  Created by usher.yue.
 * User: usher.yue
 * Date: 17/3/23
 * Time: 16:18
 * 心怀教育梦－烟台网格软件技术有限公司
 */

"use strict";

var crypto=require('crypto');
var Buffer=require('buffer').Buffer

module.exports={
    md5:str=>{
        let hasher=crypto.createHash('md5');
        hasher.update(str);
        return hasher.digest('hex');
    },
    base64Encode:str=>Buffer.from(str).toString('base64'),
    rsaSign:(key,data)=>{
        var sign = crypto.createSign('RSA-SHA256');
        sign.update(data);
        var sig = sign.sign(key, 'hex');
        return sig;
    },
    rsaVerify:(pubKey,sig,data)=>{
        var verify = crypto.createVerify('RSA-SHA256');
        verify.update(data);
        return verify.verify(pubKey, sig, 'hex');
    }

};