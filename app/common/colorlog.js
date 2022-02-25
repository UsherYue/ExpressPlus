/**
 * ExpressPlus
 * colorlog.js Created by usher.yue.
 * User: usher.yue
 * Date: 2022/2/25
 * Time: 20:37
 * 乘风破浪－log
 */

module.exports = class {
    /**
     * 成功输出
     * @param title
     * @param content
     */
    static success(title, content) {
        console.log(`\u001b[42;30m ${title} \u001b[40;32m ${content}\u001b[0m`);
    }

    /**
     * 警告输出
     * @param title
     * @param content
     */
    static warning(title, content) {
        console.log(`\u001b[43;31m ${title} \u001b[40;33m ${content}\u001b[0m`);
    }

    /**
     * 信息
     * @param title
     * @param content
     */
    static info(title, content) {
        console.log(`\u001b[46;30m ${title} \u001b[40;37m ${content}\u001b[0m`);
    }
};