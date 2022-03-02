/**
 * ExpressPlus
 * User.js Created by usher.yue.
 * User: usher.yue
 * Date: 2022/3/2
 * Time: 08:47
 * https://www.kancloud.cn/manual/thinkphp5/135195
 *
 */
/**
 *   //创建orm模型
     const userOrm=global.db.define('uc_user',{});
     userOrm.getName=function (){
        return  this.tableName;
    };
    module.exports= userORM;
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