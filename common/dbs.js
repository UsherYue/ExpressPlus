/**
 * ExpressPlus
 *  Created by usher.yue.
 * User: usher.yue
 * Date: 17/11/14
 * Time: 16:20
 * 心怀教育梦－烟台网格软件技术有限公司
 */

let exportObj = new Object();

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
        return !r ? false : true;
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
    if (false !== result) {
        return result.firstRow();
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
exportObj.gets = async (fields, table, condition) => {
    let result = await sqlBuilder.select(fields).from(table).where(condition).do();
    if (false !== result) {
        return result;
    } else {
        return false;
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
module.exports = exportObj;