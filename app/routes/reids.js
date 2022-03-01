/**
 * ExpressPlus
 * reids.js Created by usher.yue.
 * User: usher.yue
 * Date: 2022/3/1
 * Time: 17:24
 */
let router=newRouter();


/*
 * Description:测试redis
 * User: usher.yue
 * Date: 2022/03/01
 * Time: 17:25
 */
router.get('/testredis',async(req,res,next)=>{

       await redis.set('name','redis');
       let name=await redis.get('name');
       res.send(name);
});


module.exports=router;