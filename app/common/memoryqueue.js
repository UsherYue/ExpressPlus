/**
 * MemoryQueue
 *  Created by usher.yue.
 * User: usher.yue
 * Date: 2018/9/28
 * Time: 13:38
 * 进程级内存队列
 */

const DefaultInterval = 30;

function SingletonMemoryQueue(interval) {
    //闭包队列
    this._queueList = [];
    var _ctx = this;
    var _recursive = () => {
        setTimeout(_d, interval);
    };
    var _d = async function () {
        if (!_ctx._queueList.length) {
            _recursive();
            return;
        }
        let _taskObj = _ctx._queueList.shift();
        if (_taskObj.clouser) {
            await _taskObj.clouser();
            _taskObj.callback && (await _taskObj.callback(_taskObj.prm));
        }
        _recursive();
    };
    _recursive();
    //进程级存储
    global._memQueue = this;
};



/**
 * 执行队列
 * @param taskClouser
 * @param callBack
 */
SingletonMemoryQueue.prototype.process = async function (taskClouser, callBack, prm = {}) {
    this._queueList.push({
        clouser: taskClouser,
        callback: callBack,
        prm: prm,
    });
};

/**
 * 毫秒级队列
 * @type {function(*=): (MemoryQueue|*)}
 */
SingletonMemoryQueue.getSingletonQueue = ((interval) => global._singletonMemQueue || new SingletonMemoryQueue(interval||DefaultInterval));


module.exports = SingletonMemoryQueue;