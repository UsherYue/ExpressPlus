/**
 * ExpressPlus
 * _commFunc.js Created by usher.yue.
 * User: usher.yue
 * Date: 2022/7/13
 * Time: 16:13
 * 乘风破浪－烟台聚货吧电子商务有限公司
 */


if (typeof (Object.values) !== 'function') {
    Object.values = function (obj) {
        var values = [];
        for (var key in obj) {
            values.push(obj[key]);
        }
        return values;
    }
}
/**
 * 合并
 * @param targe
 * @param source
 */
Object.merge = (targe, source) => {
    for (var k in source) {
        targe[k] = source[k];
    }
}
if (!Date.now) {
    Date.now = function now() {
        return new Date().getTime();
    };
}
String.prototype.format = function (args) {
    var result = this;
    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof (args) == "object") {
            for (var key in args) {
                if (args[key] != undefined) {
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        } else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    var reg = new RegExp("({)" + i + "(})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
    }
    return result;
}
var oldJsonParser = JSON.parse;
JSON.parse = (jsonStr) => {
    try {
        return oldJsonParser(jsonStr);
    } catch (ex) {
        return null;
    }
};
/**
 * trimLeft
 * @returns {string}
 */
String.prototype.trimLeft = function () {
    var i = 0;
    for (; i < this.length && this.charAt(i) == " "; i++) ;
    return this.substring(i, this.length);
}
/**
 * trimRight
 * @returns {string}
 */
String.prototype.trimRigth = function trimRight() {
    var i = this.length - 1;
    for (; i > 0 && this.charAt(i) == " "; i--) ;
    return this.substring(0, ++i);
}
/**
 * remove right
 * @param str
 * @returns {*}
 */
String.prototype.removeSubRight = function (str) {
    let rightIndex = this.indexOf(str);
    if (-1 == rightIndex) {
        return this;
    }
    return this.substr(0, rightIndex - 1);
}

/**
 * toUnicode
 * @returns {string}
 */
String.prototype.toUnicode = function () {
    var ret = "";
    for (var i = 0; i < this.length; i++) {
        if (/[\u4e00-\u9fa5]/i.test(this[i])) {
            ret += "\\u" + this.charCodeAt(i).toString(16);
        } else {
            ret += this[i];
        }
    }
    return ret;
}
/**
 * isString
 * @returns {boolean}
 */
String.isString = function (str) {
    return (typeof str == 'string') && str.constructor == String;
}
/**
 * 获取时间可读格式
 * @param hourOnly
 * @returns {string}
 */
Date.prototype.toString = function (hourOnly = false) {
    if (!hourOnly) {
        return this.getFullYear()
            + "-" + (this.getMonth() > 8 ? this.getMonth() + 1 : "0" + (this.getMonth()))
            + "-" + (this.getDate() > 9 ? this.getDate() : "0" + this.getDate())
            + " " + (this.getHours() > 9 ? this.getHours() : "0" + this.getHours())
            + ":" + (this.getMinutes() > 9 ? this.getMinutes() : "0" + this.getMinutes())
            + ":" + (this.getSeconds() > 9 ? this.getSeconds() : "0" + this.getSeconds());
    } else {
        return (this.getHours() > 9 ? this.getHours() : "0" + this.getHours())
            + ":" + (this.getMinutes() > 9 ? this.getMinutes() : "0" + this.getMinutes())
            + ":" + (this.getSeconds() > 9 ? this.getSeconds() : "0" + this.getSeconds());
    }
}
/**
 * format
 * @param fmt
 * @returns {*}
 * @constructor
 */
Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
/**
 * strtotime
 * @param str
 * @returns {number}
 */
Date.strtotime = (str) => {
    var arr = str.split(' ');
    var day = arr[0].split('-');
    arr[1] = (arr[1] == null) ? '0:0:0' : arr[1];
    var time = arr[1].split(':');
    for (var i = 0; i < day.length; i++) {
        day[i] = isNaN(parseInt(day[i])) ? 0 : parseInt(day[i]);
    }
    for (var i = 0; i < time.length; i++) {
        time[i] = isNaN(parseInt(time[i])) ? 0 : parseInt(time[i]);
    }
    return ((new Date(day[0], day[1] - 1, day[2], time[0], time[1], time[2])).getTime()) / 1000;
}
/**
 *
 * @returns {number}
 */
Date.time = () => {
    return parseInt(Date.now() / 1000);
}
/**
 *
 * @constructor
 */
Date.EarlyMorningTime = () => {
    let date = new Date();
    let ret = parseInt(Date.parse(date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()) / 1000);
    return ret;
}
/**
 * js数组合并去重
 * @returns {Array}
 */
Array.prototype.unique = function () {
    let m = {};
    for (let v of this) {
        m[v] = true;
    }
    return Object.keys(m);
};
/**
 * inArray
 * @param val
 * @returns {boolean}
 */
Array.prototype.inArray = function (val) {
    for (let v of this) {
        if (v == val) {
            return true;
        }
    }
    return false;
}

//define constraint
global.defineConstraint = (obj, k, v) => {
    obj.__defineGetter__(k, () => v);
};
global.nowTs = global.time = () => Math.round(Date.now() / 1000);
global.isArray = (o) => {
    return Object.prototype.toString.call(o) === `[object Array]`;
}
global.isString = (str) => (typeof str == 'string') && str.constructor == String;
global.deepClone = (o) => {
    var t = o instanceof Array ? [] : {};
    for (var f in o) {
        t[f] = typeof o[f] === 'object' ? deepClone(o[f]) : o[f];
    }
    return t;
};
global.isTrueObject = obj => Array.isArray(obj) ? Boolean(obj.length) : Boolean(obj);
global.isFalseObject = obj => (!(Array.isArray(obj) ? Boolean(obj.length) : Boolean(obj)));
global.t = (obj) => Object.prototype.toString.call(obj);
global.format = global.sprintf = require('util').format;
global.filterValue = (val, defaultvalue) => (typeof (val) == 'undefined' || !val) ? defaultvalue : val;
global.return = (ret, data, msg) => ({ret: ret, data: data, msg: msg})
global.error = (data, msg) => ({status: 0, data: data, info: msg});
global.success = (data, msg) => ({status: 1, data: data, info: msg});