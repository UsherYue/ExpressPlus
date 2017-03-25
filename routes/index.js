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

module.exports = router;
