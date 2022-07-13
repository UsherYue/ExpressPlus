/**
 * ExpressPlus
 * _initRedis.js Created by usher.yue.
 * User: usher.yue
 * Date: 2022/7/13
 * Time: 16:31
 * 乘风破浪－烟台聚货吧电子商务有限公司
 */

if (!global.config || !global.config.redisConfig || !global.config.redisConfig.host) {
    return;
}
let redisServerIp = global.config.redisConfig.host;
let redisServerPort = (!global.config.redisConfig.port) ? 6379 : global.config.redisConfig.port;
let redisServerDb = (!global.config.redisConfig.db) ? 0 : global.config.redisConfig.db;
let redisServerPassword = (!global.config.redisConfig.password) ? '' : global.config.redisConfig.password;
let opt = {
    socket: {
        host: redisServerIp,
        port: redisServerPort,
        keepAlive: 3600,
        connectTimeout: 5000,
        password: redisServerPassword,
        database: redisServerDb
    },
    retry_strategy: function (options) {
        if (options.error && options.error.code === 'ECONNREFUSED') {
            return new Error('服务器拒接连接');
        }
        //1小时后停止连接
        if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('重试时间耗尽');
        }
        // 1s后重新尝试连接
        return Math.min(options.attempt * 1000, 3000);
    }
};
let redis = require("redis");
//create client
let client = redis.createClient(opt);
//socket close
client.on('error', function (err) {
    colorlog.warning("Redis", err.message);
});
//redis reconnect
client.on('reconnecting', () => {
    colorlog.warning("Redis", "Reconnect Redis Server!");
});
//redis connect
client.on('connect', function () {
    colorlog.success("Redis", "Connect Redis Server Success!");
});
client.connect();
global.redis = client;