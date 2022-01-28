/**
 * ExpressPlus
 *  Created by usher.yue.
 * User: usher.yue
 * Date: 2021/8/24
 * Time: 13:49
 * 乘风破浪－山东十二学教育科技有限公司
 */
//拦截器
var filter=newFilter();


//注册拦截器 用于参数验证
filter.get('/abc',async(req,res,next)=>{

    var num=req.query||0;
    if(num<0){
        this.fail("fail");
    }

});



module.exports=filter;