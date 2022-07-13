/**
 * ExpressPlus
 * _initStaic.js Created by usher.yue.
 * User: usher.yue
 * Date: 2022/7/13
 * Time: 16:32
 * 乘风破浪－烟台聚货吧电子商务有限公司
 */

/**
 * core
 * @param core
 */
module.exports=(core,express)=>{
    if (!global.config.staticConfig || !global.config.staticConfig.length) {
        core.use('/static', express.static(`${APP_ROOT}/static`));
    } else {
        global.config.staticConfig.forEach(function (item, index, array) {
            core.use(item.router, express.static(`${APP_ROOT}/${item.path}`, {index: item.index ? item.index : 'index.html'}));
        });
    }
};