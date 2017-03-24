/**
 * ApiBareFramework
 *  Created by usher.yue.
 * User: usher.yue
 * Date: 17/3/23
 * Time: 16:37
 * 心怀教育梦－烟台网格软件技术有限公司
 */

"use strict";

var crypto=require('crypto');

module.exports={
    md5:str=>{
        let hasher=crypto.createHash('md5');
        hasher.update(str);
        return hasher.digest('hex');
    }
};