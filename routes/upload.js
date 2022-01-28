/**
 * ApiBareFramework
 *  Created by usher.yue.
 * User: usher.yue
 * Date: 17/3/24
 * Time: 14:40
 */

var router = newRouter();
var fs=require('fs')

router.uploadFile('/upload','../upload/','logo',function (req,res,next) {
    res.send("文件提交成功!");
});

router.get('/form',function (req,res,next) {
    var form = fs.readFileSync('../upload.html', {encoding: 'utf8'});
    res.send(form);
});


module.exports = router;