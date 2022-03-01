/**
 * ExpressPlus
 *  Created by usher.yue.
 * User: usher.yue
 * Date: 2021/10/20
 * Time: 17:53
 * 缓存模型
 */

class CacheModel {

    /**
     * token换缓存类型  memory  or  redis
     * @type {string}
     * @private
     */
    _cacheType = 'memory';

    /**
     * 缓存类型
     * @param cacheType
     */
    constructor(cacheType = 'memory') {
        this._cacheType = cacheType;
        //内存Cache
        switch (cacheType) {
            case 'memory': {
                global.cacheStore = new Map();
                break;
            }
            case 'redis': {
                global.cacheStore = global.redis;
                break;
            }
        }
    }

    /**
     * 获取token
     * @param k
     * @returns {V}
     */
    async get(k) {
        switch (this._cacheType) {
            case 'memory': {
                let v = cacheStore.get(k);
                //时间没有
                if (v && v.expire > nowTs()) {
                    return v.data;
                }
                //时间过期
                if (v && v.expire <= nowTs()) {
                    cacheStore.delete(k);
                    return false;
                }
                return false;
            }
            case 'redis': {
                return await redis.getAsync(k.toString());
            }
        }
    }

    /**
     *
     * @param k
     * @param v
     * @param lifeTime
     */
    async set(k, v, lifeTime = 3600) {
        switch (this._cacheType) {
            case 'memory': {
                //缺少生命周期优化
                cacheStore.set(k, {data: v, expire: nowTs() + lifeTime});
                break;
            }
            case 'redis': {
                await redis.setAsync(k.toString(), JSON.stringify(v), 'EX', lifeTime);
                break;
            }
        }
    }

    /**
     *删除cache
     * @param k
     */
    async del(k) {
        switch (this._cacheType) {
            case 'memory': {
                cacheStore.delete(k);
                break;
            }
            case 'redis': {
                await redis.del(k.toString());
                break;
            }
        }
        return true;
    }
}


module.exports = new CacheModel('memory');