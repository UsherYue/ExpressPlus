/**
 * K12_ServiceAPI
 *  Created by usher.yue.
 * User: usher.yue
 * Date: 17/1/9
 * Time: 19:40
 * 心怀教育梦－烟台网格软件技术有限公司
 */

var router =global.newRouter();

router.get('/abc', function (req, res, next) {
  
    res.json('hello,aaa!');
});

module.exports = router;
