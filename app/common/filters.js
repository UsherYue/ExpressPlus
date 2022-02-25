/**
 * ExpressPlus
 * filters.js Created by usher.yue.
 * User: usher.yue
 * Date: 2022/2/25
 * Time: 19:39
 * 多个注解返回false不继续路由 res.send()输出内容结束路由
 * 验证通过直接返回true就行
 */

module.exports=new class{

    /**
     * @param req
     * @param res
     * @param next
     * @returns {Promise<Boolean>}
     * @constructor
     */
    async LoginCheck(req,res){

        //res.send('未登录请登录!')
        return true;
    }

    async Test(req,res){

        res.send('Test!')
        return false;
    }

    /**
     * 访问检测
     * @param req
     * @param res
     * @param next
     * @returns {Promise<Boolean>}
     * @constructor
     */
    async AccessCheck(req,res){

       // res.send('身份授权未通过 ');
        return true;
    }

};