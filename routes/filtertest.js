/**
 * ExpressPlus
 * filtertest.js Created by usher.yue.
 * User: usher.yue
 * Date: 2022/2/24
 * Time: 18:25
 * 乘风破浪－注解扩展
 */

let router=newRouter();



//@Document(2020-11-11,过滤拦截路由,prm1 整数,prm2 字符串)
//@Filter(LoginCheck,AccessCheck1)
router.get('/filter1',async(req,res,next)=>{

    res.send('test');
});


//@Document(2020-11-11,过滤拦截路由,prm1 整数,prm2 字符串)
//@Filter(LoginCheck)
router.get('/filter2',async(req,res,next)=>{

    res.send('test');
});




module.exports=router;