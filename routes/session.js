/**
 * ExpressPlus
 *  Created by usher.yue.
 * User: usher.yue
 * Date: 17/3/25
 * Time: 16:08
 */
let router=global.newRouter();
router.get('/test',function (req,res,next) {
    if(!req.session.uid){
        req.session.uid=11111111;
        console.log('lalalallalalal');
    }else{
        console.log('1111');
    }
    res.json(req.session);
});

module.exports=router;