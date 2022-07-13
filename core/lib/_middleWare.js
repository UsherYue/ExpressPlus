/**
 * ExpressPlus
 * _middleWare.js Created by usher.yue.
 * User: usher.yue
 * Date: 2022/7/13
 * Time: 16:16
 * 乘风破浪－烟台聚货吧电子商务有限公司
 */

if (config.middleWare && config.middleWare.length) {
    for (let middleWare of config.middleWare) {
        core.use(require(`${APP_PATH}middleware/${middleWare}`));
    }
}
global.mw = {
    crosser: (allowOrigin, allowHeader, allowMethod, allowCredential) => {
        return (req, res, next) => {
            res.header("Access-Control-Allow-Credentials", allowCredential || "true");
            res.header("Access-Control-Allow-Headers", allowHeader || "*");
            res.header("Access-Control-Allow-Origin", allowOrigin || req.headers.origin || "*");
            res.header("Access-Control-Allow-Methods", allowMethod || "POST, GET");
            res.header("X-Powered-By", 'CrossDomainAllower');
            next();
        };
    },
    /*
    *csrf protection middleware
    *core.get('/form', csrfProtection, function (req, res) {
    *  // pass the csrfToken to the view
    *  res.render('send', { csrfToken: req.csrfToken() })
    *})
    *
    *<form action="/process" method="POST">*
    *   <input type="hidden" name="_csrf" value="{{csrfToken}}">
    *   Favorite color: <input type="text" name="favoriteColor">
    *   <button type="submit">Submit</button>
    * </form>
    */
    csrfProtection: () => {
        let csrf = require('csurf');
        return csrf({cookie: true});
    }
};