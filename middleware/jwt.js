/**
 * ExpressPlus
 * jwt.js Created by usher.yue.
 * User: usher.yue
 * Date: 2022/2/24
 * Time: 09:08
 * 乘风破浪－jwt拦截器
 */

/**
 * 是否需要登录访问 未登录返回false 成功返回{uid:111}
 * @param jwtToken
 * @returns {Promise<Object>}
 * @constructor
 */
const CheckLogin = async (jwtToken) => {
    //校验token
    let data = jwt.verify(jwtToken);
    if (!data) {
        return false;
    }
    ///////判断token中的uid存在 并且非伪造也可以不严重///////////////


    ////////////////////////////////////////////////////
    return {uid: data.uid};
};

/**
 * 是否需要验证某些角色 权限才可以访问
 * @param uid
 * @param reqPath
 * @returns {Promise<boolean>}
 * @constructor
 */
const CheckRouterRight = async (uid, reqPath) => {


    return false;
};


module.exports = async (req, res, next) => {

    //获取头部认证
    const jwtToken = req.get('Authorization') || '';
    const reqPath = req.path;
    const loginInfo = await CheckLogin(jwtToken);
    //未登录 或者token过期直接跳转到登录页面 修改为未登录
    if (!loginInfo) {
        // res.redirect('https://www.baidu.com');
        res.send(success({
            status: 0
        }, '未登录!'))
        return;
    }
    let uid = loginInfo.uid;
    //没有权限访问的操作   修改为无权限页面
    if (!await CheckRouterRight(uid, reqPath)) {
        res.send(success({
            status: 2
        }, '当前用户无访问权限!'))
        // res.redirect('https://www.baidu.com');
        return;
    }
    ///有权限之后直接next
    next();
};