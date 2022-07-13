/**
 * ExpressPlus
 * _initTemplate.js Created by usher.yue.
 * User: usher.yue
 * Date: 2022/7/13
 * Time: 16:27
 * 乘风破浪－烟台聚货吧电子商务有限公司
 */
const path = require('path');
module.exports = (core) => {
    let tplPath = path.join(__dirname, '../../app/', config?.templateConfig?.viewsPath ?? 'views');
    let useCache = config?.templateConfig?.userCache ?? false;
    let viewEngine = config?.templateConfig?.viewEngine ?? 'artTemplate';
    let defaultTplExt = config?.templateConfig?.extName ?? '.html';
    //set engine
    core.set('view engine', defaultTplExt);
    //view path
    core.set('views', tplPath);
    //view cache
    core.set('view cache', useCache);
    switch (viewEngine) {
        case 'artTemplate': {
            core.engine(defaultTplExt.replace(".", ""), require('express-art-template'));
            core.set('view options', {
                base: '',
                debug: true,
                extname: defaultTplExt,
                engine: defaultTplExt,
                cache: useCache,
                'encoding': 'utf8',
            });
            global.renderToHtml = (view, data) => {
                let template = require('art-template');
                let parseFile = path.join(process.cwd(), 'views', view + defaultTplExt)
                let html = template(parseFile, data);
                return html;
            };
            break;
        }
        default: {
            //adapter
            //https://github.com/tj/consolidate.js
            let templateAdapter = require(`${APP_ROOT}/core/adapter/tpl/express-common-template`);
            let view = templateAdapter(viewEngine);
            if (!view) {
                colorlog.warning('TemplateEngine', '无法加载模板引擎' + viewEngine);
                break;
            }
            //loda tpl engine
            core.engine(defaultTplExt.replace(".", ""), view);
            //renderToHtml
            global.renderToHtml = templateAdapter.renderToHtml;
        }
    }
};