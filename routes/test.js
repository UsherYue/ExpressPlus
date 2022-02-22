/**
 * K12_ServiceAPI
 *  Created by usher.yue.
 * User: usher.yue
 * Date: 17/1/9
 * Time: 19:40
 */

var router = global.newRouter();
var co = require('co');
//global.db
//global.newRouter()
//global.redis
//, { type: global.db.QueryTypes.SELECT}
router.get('/test1', function (req, res, next) {
    // co(function *() {
    //   yield global.db.query('select * from test where name=\'123213\' limit 1',{ type:  global.db.QueryTypes.SELECT}).then(function (result) {
    //       console.log(result);
    //    });
    // });
    // co(function *() {
    //     var promise=global.db.query('select * from test where name=\'123213\' limit 1',{ type:  global.db.QueryTypes.SELECT});
    //     console.log(promise instanceof  Promise);
    //   //  var result=yield global.db.query('select * from test where name=\'123213\' limit 1',{ type:  global.db.QueryTypes.SELECT});
    //    // console.log(result);
    // });
    // global.db.query('select * from test where name=\'123213\' limit 1',{ type:  global.db.QueryTypes.SELECT}).then(function (result) {
    //     res.json(result);
    // });
    //
    //   var result = sqlBuilder.select("a.id,a.name,b.info").from("a").leftJoin('b').on("a.id=b.id").orderBy('a.createtime').asc().sql();
    //   console.log(result);
    //   var result = sqlBuilder.update("a").set("a=a+1", "b=b-1").where("a=1").and("b>1").sql();
    //   console.log(result);
    //   var result = sqlBuilder.update("a").set({a: 1, b: 2, c: 3, d: 'd-1'}).where("a=1").and("b>=1").sql();
    //   console.log(result);
    //   var result = sqlBuilder.delete("a").where({a: 1, b: 2, c: 3, d: ">1"}).and("b>=1").sql();
    //   console.log(result);
    //   var result = sqlBuilder.delete("a").where("a>1").and("b>=1").sql();
    //   console.log(result);
    //   var result = sqlBuilder.delete("a").where("a>1", "b<1", "d>=1").and("b>=1").sql();
    //   console.log(result);
    var sqlBuilder =global.newSqlBuilder()
      var result = sqlBuilder.insertInto("a", [{a: 'fn:now()', b: 2, c: 3}, {a: 1, b: 2, c: 3}, {a: 1, b: 2, c: 3}, {
          a: 1,
          b: 2,
          c: 3
      }]).sql();
      // console.log(result);
      // var result = sqlBuilder.insertInto("a", {a: 'fn:now()', b: 2, c: 3})._insert;
      console.log(result);
      // result=sqlBuilder.select('count(a) as id','count(b) as b').from('abc as abcd ').where({a:1}).innerJoin('c').on('a.id=c.id').sql();
      // console.log(result);

    // global.db.getPages(" select * from test ", 10, 10, true).then(function (data) {
    //     res.json(data);
    // }).catch(function (err) {
    //     res.json(err);
    // });
    //
    //  co(function *() {
    //     var data=yield global.db.getPages(" select * from test group by id having id%2=0 ", 10, 10, true);
    //     res.send(data);
    //  });

    // let sqlBuilder=global.newSqlBuilder();
    // let sqlBuilder1=global.newSqlBuilder();
    // sqlBuilder1.select("*").from('aaaadddd');
    // let sql=sqlBuilder.select("*").fromSubquery(sqlBuilder1,'a').where("a>1").sql();
    // console.log(sql);
});

//
router.get('/test2', function (req, res, next) {
    console.log(req.__('Hello'));
    console.log(getLocale())
    console.log(getLocales());
     setLocale('zh-TW');
     console.log(getLocale());
     console.log(__('Hello'));
     setLocale('zh-CN')
     console.log(L('Hello'));
     res.send('test');
});


router.get('/testjwt',async (req,res,next)=>{
    let token=jwt.sign({a:1},'1d');
    // jwt.echo();
    res.send(token);

});

router.get('/verifyjwt',async(req,res,next)=>{
    const token=req.query.token||'';
    let data=await jwt.verify(token);
    res.send(data);
});

module.exports = router;
