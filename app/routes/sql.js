/**
 * ExpressPlus
 * sql.js Created by usher.yue.
 * User: usher.yue
 * Date: 2022/3/1
 * Time: 17:29
 *测试sql
 */
let router=newRouter();

/*
 * Description:测试sql
 * User: usher.yue
 * Date: 2022/03/01
 * Time: 17:30
 */
router.get('/testdb',async(req,res,next)=>{

     let ret=await db.select('select 1  as a');
     res.send(ret);

});

module.exports=router;