/**
 * ExpressPlus
 * UserVModel.js Created by usher.yue.
 * User: usher.yue
 * Date: 2022/3/2
 * Time: 08:47
 * 通过VModel 虚拟模型进行数据库操作
 */


//创建虚拟模型
const userVM=global.VModel('uc_user');

/**
 * 添加模型业务方法
 * @returns {*}
 */
userVM.getName=function(){
    return this.tableName;
};

//导出模型
module.exports= userVM;