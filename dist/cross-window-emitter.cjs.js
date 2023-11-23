'use strict';

var cache2 = require('cache2');

// 事件触发器缓存最长保留时间，轮询时间不能超过该时间一半
var MAX_EMITTER_TIME = 30 * 60 * 1000;
// 处理程序
var handlers = {
    data: {},
    // 添加处理程序
    add: function (eventName, listener) {
        if (!this.data[eventName]) {
            this.data[eventName] = [];
        }
        this.data[eventName].push({
            timestamp: Date.now(), // 注册或触发时间，如果该时间大于触发时间则不触发。
            fn: listener
        });
    },
    // 删除处理程序
    remove: function (eventName, listener) {
        if (this.data[eventName] && listener) {
            this.data[eventName] = this.data[eventName].filter(function (item) { return item.fn !== listener; });
        }
        else {
            this.data[eventName] = [];
        }
    },
    // 获取处理程序
    get: function (eventName) {
        return this.data[eventName] || [];
    },
    // 是否还有处理程序
    has: function (eventName) {
        var eventList = this.get(eventName);
        return eventList.length > 0;
    }
};
// 触发器缓存
var emitterStorage = new cache2.Cache('__private_cross_window_emitter__', {
    stdTTL: MAX_EMITTER_TIME,
    storage: window.localStorage
});
// 运行
var run = function (eventName, cb) {
    return function () {
        var curEmitter = emitterStorage.get(eventName);
        var curHandlers = handlers.get(eventName);
        if (curEmitter) {
            curHandlers.forEach(function (_a, index) {
                var timestamp = _a.timestamp, fn = _a.fn;
                if (timestamp < curEmitter.timestamp) {
                    cb === null || cb === void 0 ? void 0 : cb();
                    curHandlers[index].timestamp = Date.now(); // 更新执行时间
                    fn.apply(null, curEmitter.params);
                }
            });
        }
    };
};
// 轮询管理
var polling = {
    data: {},
    // 开始轮询
    start: function (eventName, fn, pollingInterval) {
        if (pollingInterval === void 0) { pollingInterval = 500; }
        if (!eventName) {
            return;
        }
        if (!this.data[eventName]) {
            this.data[eventName] = {
                timestamp: Date.now(), // 开始轮询时间
                pollingInterval: pollingInterval,
                timer: null
            };
        }
        var curPolling = this.data[eventName];
        curPolling.pollingInterval = pollingInterval;
        clearInterval(curPolling.timer);
        curPolling.timer = setInterval(fn, pollingInterval);
    },
    // 停止轮询
    stop: function (eventName) {
        if (!eventName || !this.data[eventName]) {
            return;
        }
        clearInterval(this.data[eventName].timer);
    },
    // 设置轮询时间
    setPollingInterval: function (eventName, pollingInterval) {
        if (pollingInterval === void 0) { pollingInterval = 500; }
        if (!eventName || !this.data[eventName] || !pollingInterval) {
            return;
        }
        if (pollingInterval > MAX_EMITTER_TIME / 2) {
            console.warn("polling interval no more than ".concat(MAX_EMITTER_TIME, "."));
            pollingInterval = MAX_EMITTER_TIME / 2;
        }
        var curPolling = this.data[eventName];
        clearInterval(curPolling.timer);
        this.start(eventName, run(eventName), pollingInterval);
    }
};
/**
 * 注册事件
 *
 * @param {string} eventName 事件名称
 * @param {function} listener 回调函数
 */
var on = function (eventName, listener) {
    handlers.add(eventName, listener);
    polling.start(eventName, run(eventName));
};
/**
 * 注册一次事件，执行后移除该监听方法
 *
 * @param {string} eventName 事件名称
 * @param {function} listener 回调函数
 */
var once = function (eventName, listener) {
    var isRun = false; // 标识是否运行过函数
    handlers.add(eventName, listener);
    polling.start(eventName, function () {
        if (isRun) {
            handlers.remove(eventName, listener); // 移除该监听方法
            if (!handlers.has(eventName)) {
                polling.stop(eventName); // 如果没有处理程序，停止轮询
            }
        }
        run(eventName, function () {
            isRun = true;
        })();
    });
};
/**
 * 解绑事件，如不传第二参数，将移除全部 eventName 的事件
 *
 * @param {string} eventName 事件名称
 * @param {function} [listener] 回调函数
 */
var off = function (eventName, listener) {
    handlers.remove(eventName, listener);
    if (!handlers.has(eventName)) {
        polling.stop(eventName);
    }
};
/**
 * 触发事件
 *
 * @param {string} eventName 事件名称
 * @param {any[]} ...args 剩余参数用于传参
 */
var emit = function (eventName) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    emitterStorage.set(eventName, {
        timestamp: Date.now(), // 触发时间
        params: args || []
    });
};
// // 销毁，全部取消轮询
// const destroy = () => {
//   const eventNames = Object.keys(handlers.data);
//   eventNames.forEach(eventName => polling.stop(eventName));
//   handlers.remove();
// }
/**
 * 设置轮询时间
 *
 * @param {string} eventName 事件名称
 * @param {number} pollingInterval 轮询时间，单位毫秒
 */
var setPollingInterval = function (eventName, pollingInterval) {
    polling.setPollingInterval(eventName, pollingInterval);
};

exports.emit = emit;
exports.off = off;
exports.on = on;
exports.once = once;
exports.setPollingInterval = setPollingInterval;
