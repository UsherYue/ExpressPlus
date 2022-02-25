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
exportObj.c = async (key, value) => {
    if (value === undefined) {
        let r = await sqlBuilder.select('*').from('bi_config').where({'`key`': key}).do();
        if (!isTrueObject(r)) {
            return false;
        } else {
            return r[0]['value'];
        }
    } else {
        if (await exportObj.exists('bi_config', {'`key`': key})) {
            await exportObj.sets({value: value}, 'bi_config', {'`key`': key});
        } else {
            await exportObj.puts('bi_config', {value: value, 'key': key});
        }
    }
}

/**
 * multi insert
 * @param table
 * @param rows
 * @returns {Promise.<boolean>}
 */
exportObj.puts = async (table, rows) => {
    if (!table || !rows) {
        return false;
    }
    let r = await sqlBuilder.insertInto(table, rows).do();
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
exportObj.exists = async (table, condition) => {
    let rows = await sqlBuilder.select('1').from(table).where(condition).limit(1).do();
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
exportObj.getOne = async (fields, table, condition) => {
    let result = await sqlBuilder.select(fields).from(table).where(condition).limit(1).do();
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
exportObj.gets = async (fields, table, condition, order) => {
    let result = null;
    if (order)
        result = await sqlBuilder.select(fields).from(table).where(condition).orderBy(order).do();
    else
        result = await sqlBuilder.select(fields).from(table).where(condition).do();
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
exportObj.sets = async (set, table, condition) => {
    let result = await sqlBuilder.update(table).set(set).where(condition).do();
    return result;
}

/**
 * 获取数目
 * @param table
 * @param condition
 * @returns {Promise.<Number>}
 */
exportObj.count = async (table, condition) => {
    let result = await sqlBuilder.select('count(1) as c').from(table).where(condition).do();
    return !result.length ? 0 : parseInt(result[0]['c']);
}

/**
 * 获取数目针对指定字段
 * @param table
 * @param condition
 * @returns {Promise.<Number>}
 */
exportObj.countByField = async (table, condition,field='count(1)',alias='c') => {
    let result = await sqlBuilder.select(`${field} as ${alias}`).from(table).where(condition).do();
    return !result.length ? 0 : parseInt(result[0]['c']);
}

exportObj.hasTable = async (tableName) => {
    let ret = await db.showtable(`show tables like '${tableName}'`);
    return ret && ret.length;
}
module.exports = exportObj;