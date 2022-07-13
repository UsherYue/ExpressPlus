/**
 * ExpressPlus
 *  Created by usher.yue.
 * User: usher.yue
 * Date: 17/11/14
 * Time: 16:20
 */

let exportObj = new Object();


/**
 * 从数据库获取配置,或者设置
 * @param key
 * @returns {boolean}
 * @constructor
 */
exportObj.c = async function (key, value)  {
    if (value === undefined) {
        let r = await sqlBuilder.select('*').from('bi_config').where({'`key`': key}).do(this.sourceName??false);
        if (!isTrueObject(r)) {
            return false;
        } else {
            return r[0]['value'];
        }
    } else {
        if (await this.exists('bi_config', {'`key`': key})) {
            await this.sets({value: value}, 'bi_config', {'`key`': key});
        } else {
            await this.puts('bi_config', {value: value, 'key': key});
        }
    }
}

/**
 * multi insert
 * @param table
 * @param rows
 * @returns {Promise.<boolean>}
 */
exportObj.puts = async function (table, rows) {
    if (!table || !rows) {
        return false;
    }
    let r = await sqlBuilder.insertInto(table, rows).do(this.sourceName??false);
    if (Array.isArray(rows)) {
        return r !== false;
    } else {
        return r === false ? false : r;
    }
}

/**
 * 判断是否存在记录
 * @param table
 * @param prms
 * @returns {Promise.<boolean>}
 */
exportObj.exists = async function (table, condition)  {
    let rows = await sqlBuilder.select('1').from(table).where(condition).limit(1).do(this.sourceName??false);
    if (rows.length > 0) {
        return true;
    } else {
        return false;
    }
}

/**
 * 获取一条记录
 * @param fields
 * @param table
 * @param condition
 * @returns {Promise.<void>}
 */
exportObj.getOne = async function (fields, table, condition) {
    let result = await sqlBuilder.select(fields).from(table).where(condition).limit(1).do(this.sourceName??false);
    if (isTrueObject(result)) {
        return result[0];
    } else {
        return false;
    }
}

/**
 * 获取多条记录
 * @param fields
 * @param table
 * @param condition
 * @returns {Promise.<*>}
 */
exportObj.gets = async function (fields, table, condition, order) {
    let result = null;
    if (order)
        result = await sqlBuilder.select(fields).from(table).where(condition).orderBy(order).do(this.sourceName??false);
    else
        result = await sqlBuilder.select(fields).from(table).where(condition).do(this.sourceName??false);
    if (result) {
        return result;
    } else {
        return [];
    }
}
/**
 * 更新多条记录
 * @param set
 * @param table
 * @param condition
 * @returns {Promise.<boolean>}
 */
exportObj.sets = async function (set, table, condition){
    let result = await sqlBuilder.update(table).set(set).where(condition).do(this.sourceName??false);
    return result;
}

/**
 * 获取数目
 * @param table
 * @param condition
 * @returns {Promise.<Number>}
 */
exportObj.count = async function (table, condition){
    let result = await sqlBuilder.select('count(1) as c').from(table).where(condition).do(this.sourceName??false);
    return !result.length ? 0 : parseInt(result[0]['c']);
}

/**
 * 获取数目针对指定字段
 * @param table
 * @param condition
 * @returns {Promise.<Number>}
 */
exportObj.countByField = async function (table, condition,field='count(1)',alias='c')  {
    let result = await sqlBuilder.select(`${field} as ${alias}`).from(table).where(condition).do(this.sourceName??false);
    return !result.length ? 0 : parseInt(result[0]['c']);
}

exportObj.hasTable = async (tableName) => {
    let tmpDb= (this.sourceName?global.selectDBSource(this.sourceName):db);
    let ret = await tmpDb.showtable(`show tables like '${tableName}'`);
    return ret && ret.length;
}


/**
 * 复制DBS,操作多数据源
 * @param sourceName
 * @returns {Promise<Object>}
 */
exportObj.selectDBSource= function (sourceName){
     let tmpDbs=Object.create(exportObj) ;
     tmpDbs.sourceName=sourceName;
     return tmpDbs;
}

module.exports = exportObj;