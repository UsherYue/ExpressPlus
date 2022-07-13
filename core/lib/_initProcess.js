/**
 * ExpressPlus
 * _initProcess.js Created by usher.yue.
 * User: usher.yue
 * Date: 2022/7/13
 * Time: 16:25
 * 乘风破浪－烟台聚货吧电子商务有限公司
 */
//防止进程退出
process.on('uncaughtException', (err) => {
    console.log(err.message);
});


//处理异常
process.on('unhandledRejection', (reason, p) => {
    console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason);
});
