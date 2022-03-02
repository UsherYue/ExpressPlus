/**
 * ExpressPlus
 * UserVModel.js Created by usher.yue.
 * User: usher.yue
 * Date: 2022/3/2
 * Time: 08:47
 * 通过sequlize 直接进行数据库orm 定义 同步操作
 */
    //创建orm模型
const userOrmModel = global.db.define('uc_user', {
        name: DB.DataTypes.TEXT,
        favoriteColor: {
            type: DB.DataTypes.TEXT,
            defaultValue: 'green'
        },
        age: DB.DataTypes.INTEGER,
        cash: DB.DataTypes.INTEGER
    });

/**
 * 获取表名字
 * @returns {*}
 */
userOrmModel.getName = function () {
    return this.tableName;
};

module.exports = userOrmModel;




