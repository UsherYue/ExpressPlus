/**
 * ExpressPlus
 * _initI18N.js Created by usher.yue.
 * User: usher.yue
 * Date: 2022/7/13
 * Time: 16:35
 * 乘风破浪－烟台聚货吧电子商务有限公司
 */
const fs=require('fs');
module.exports=(core,i18nPath, ext)=>{
    try {
        const locales = [];
        let files = fs.readdirSync(i18nPath);
        files.forEach(function (fileName, index) {
            if (fileName.lastIndexOf('.json') !== -1) {
                let i18nName = (fileName.indexOf('.') == -1) ? fileName : fileName.split('.')[0];
                locales.push(i18nName);
            }
        });
        if (locales) {
            var i18n = require('i18n');
            //config i18n support
            i18n.configure({
                locales: locales,
                defaultLocale: 'zh-CN',
                directory: i18nPath,
                updateFiles: false,
                indent: "\t",
                extension: ext,
                logDebugFn: function (msg) {
                    //console.log('debug', msg);
                },
                logWarnFn: function (msg) {
                    // console.log('warn', msg);
                },
                logErrorFn: function (msg) {
                    //console.log('error', msg);
                }
            });
            //use i18n middleware
            core.use(i18n.init);
            global.__ = (...args) => i18n.__(...args);
            global.__n = (...args) => i18n.__n(...args);
            global.__h = (...args) => i18n.__h(...args);
            global.__mf = (...args) => i18n.__mf(...args);
            global.L = (...args) => i18n.__(...args);
            global.setLocale = (local) => {
                i18n.setLocale(local)
            };
            global.getLocale = () => i18n.getLocale(...arguments);
            global.getLocales = () => i18n.getCatalog();
        }
    } catch (ex) {
        console.error(ex.toString());
    }
}