/**
 * K12_ServiceAPI
 *  Created by usher.yue.
 * User: usher.yue
 * Date: 17/1/9
 * Time: 19:40
 */

var router =global.newRouter();

router.get('/abc', function (req, res, next) {
  
    res.json('hello,aaa!');
});

//http://127.0.0.1:3001/index/v1/index访问 模板引擎
router.get('/index',function (req,res,next) {
    res.render('index',{
        list:[1,2,3,4,5]
    });
});


module.exports = router;
