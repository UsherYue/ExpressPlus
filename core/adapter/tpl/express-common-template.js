/**
 * ExpressPlus
 * express-common-template.js Created by usher.yue.
 * User: usher.yue
 * Date: 2022/3/2
 * Time: 10:29
 * express  ejs驱动
 */
var cons = require('consolidate');


/**
 * common template engine
 * @param enginName
 * @returns {*}
 */
var engine = (enginName)=>{
    return cons[enginName];
};

/**
 * render to html
 * @param view
 * @param options
 * @returns {Promise<*>}
 */
engine.renderToHtml=async (view,options)=>{
    let html=await cons.swig(view, options);
    return html;
};


module.exports = engine;