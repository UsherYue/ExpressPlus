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
    }
    if(!req.cookies.x){
        res.cookie('x',1111111111111);
    }
    console.log(req.cookies);
    res.json(req.session);
});

module.exports=router;