/**
 * ExpressPlus
 * User.js Created by usher.yue.
 * User: usher.yue
 * Date: 2022/3/2
 * Time: 08:47
 * https://www.kancloud.cn/manual/thinkphp5/135195
 */
module.exports= new class {

  _init(){
      this._tablebind='uc_user';
  }

   _getUser(opts){
       return this.delete(opts);
   }
   __beforeInsert(){

   }



};