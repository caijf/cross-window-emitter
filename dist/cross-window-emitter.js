(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.crossWindowEmitter = {}));
})(this, (function (exports) { 'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    var EmitterPro = /** @class */ (function () {
        function EmitterPro() {
            this.handler = {};
        }
        EmitterPro.prototype.eventNames = function () {
            return Object.keys(this.handler);
        };
        EmitterPro.prototype.listeners = function (eventName) {
            return this.handler[eventName] || [];
        };
        EmitterPro.prototype.hasListener = function (eventName, listener) {
            return this.listeners(eventName).some(function (item) { return item === listener; });
        };
        EmitterPro.prototype.on = function (eventName, listener) {
            if (!this.handler[eventName]) {
                this.handler[eventName] = [listener];
            }
            else {
                // 不允许添加相同的方法
                if (!this.hasListener(eventName, listener)) {
                    this.handler[eventName].push(listener);
                }
            }
            return this;
        };
        EmitterPro.prototype.off = function (eventName, listener) {
            if (this.handler[eventName]) {
                if (typeof listener === 'function') {
                    this.handler[eventName] = this.handler[eventName].filter(function (item) { return item !== listener; });
                }
                else {
                    delete this.handler[eventName];
                }
            }
            return this;
        };
        EmitterPro.prototype.emit = function (eventName) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var listeners = this.listeners(eventName);
            if (listeners.length > 0) {
                listeners.forEach(function (listener) {
                    // eslint-disable-next-line prefer-spread
                    listener.apply(void 0, args);
                });
                return true;
            }
            return false;
        };
        EmitterPro.prototype.once = function (eventName, listener) {
            var _this = this;
            var wrap = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                // eslint-disable-next-line prefer-spread
                listener.apply(void 0, args);
                _this.off(eventName, wrap);
            };
            return this.on(eventName, wrap);
        };
        EmitterPro.prototype.offAll = function () {
            this.handler = {};
            return this;
        };
        return EmitterPro;
    }());

    // 随机字符串
    function randomString() {
        return Math.random().toString(16).substring(2, 8);
    }
    // 内部自增id
    var uid = 1;
    // 返回唯一标识
    function getUniqueId(id) {
        return typeof id === 'string' && id ? id : "".concat(randomString(), "_").concat(uid++);
    }
    // 是否支持 storage
    function isStorageSupported(storage) {
        try {
            var isSupport = typeof storage === 'object' &&
                storage !== null &&
                !!storage.setItem &&
                !!storage.getItem &&
                !!storage.removeItem;
            if (isSupport) {
                var key = getUniqueId();
                var value = '1';
                storage.setItem(key, value);
                if (storage.getItem(key) !== value) {
                    return false;
                }
                storage.removeItem(key);
            }
            return isSupport;
        }
        catch (e) {
            console.error("[cache2] ".concat(storage, " is not supported. The default memory cache will be used."));
            return false;
        }
    }
    function parse(value, reviver) {
        try {
            return JSON.parse(value, reviver);
        }
        catch (e) {
            return value;
        }
    }
    function stringify(value, replacer) {
        return JSON.stringify(value, replacer);
    }
    var inWindow = typeof window !== 'undefined' && typeof window === 'object' && window.window === window;

    var cache = {};
    var memoryStorage = {
        getItem: function (key) {
            return cache[key] || null;
        },
        setItem: function (key, value) {
            cache[key] = value;
        },
        removeItem: function (key) {
            delete cache[key];
        }
    };

    var Storage = /** @class */ (function () {
        function Storage(storage, options) {
            this.isSupported = storage ? isStorageSupported(storage) : false;
            this.keyPrefix = (options === null || options === void 0 ? void 0 : options.prefix) || (this.isSupported ? '' : getUniqueId());
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.storage = this.isSupported ? storage : memoryStorage;
            this.isMemoryStorage = !this.isSupported || storage === memoryStorage;
            this.options = __assign({ needParsed: !this.isMemoryStorage }, options);
            this._keys = {};
        }
        Storage.prototype.getKey = function (key) {
            return this.keyPrefix + key;
        };
        Storage.prototype.get = function (key) {
            var k = this.getKey(key);
            var data = this.storage.getItem(k);
            return this.options.needParsed ? parse(data, this.options.reviver) : data;
        };
        Storage.prototype.set = function (key, data) {
            var k = this.getKey(key);
            this.storage.setItem(k, this.options.needParsed ? stringify(data, this.options.replacer) : data);
            if (this.isMemoryStorage) {
                // 内部标记
                this._keys[key] = 1;
            }
        };
        Storage.prototype.del = function (key) {
            var k = this.getKey(key);
            this.storage.removeItem(k);
            if (this.isMemoryStorage) {
                delete this._keys[key];
            }
        };
        Storage.prototype.clear = function () {
            var _this = this;
            if (typeof this.storage.clear === 'function') {
                this.storage.clear();
            }
            else if (this.isMemoryStorage) {
                var keys = Object.keys(this._keys);
                keys.forEach(function (key) {
                    _this.del(key);
                });
            }
        };
        return Storage;
    }());

    var defaultPrefix = 'cache2_';
    var defaultNamespace = 'default';
    var Cache = /** @class */ (function (_super) {
        __extends(Cache, _super);
        function Cache(namespace, options) {
            var _this = _super.call(this) || this;
            var k, opts;
            if (typeof namespace === 'string') {
                k = namespace;
            }
            else if (typeof namespace === 'object') {
                opts = namespace;
            }
            if (!opts && typeof options === 'object') {
                opts = options;
            }
            _this.options = __assign({ max: -1, stdTTL: 0, maxStrategy: 'limited', checkperiod: 0, prefix: defaultPrefix }, opts);
            _this.storage = new Storage(_this.options.storage, _this.options);
            if (!_this.storage.isMemoryStorage && !k) {
                k = defaultNamespace;
            }
            _this.cacheKey = getUniqueId(k);
            _this.startCheckperiod();
            return _this;
        }
        // 检查当前键值是否过期，如果过期将会自动删除
        Cache.prototype._check = function (key, data) {
            var ret = true;
            if (data.t !== 0 && data.t < Date.now()) {
                ret = false;
                this.del(key);
                this.emit('expired', key, data.v);
            }
            return ret;
        };
        Cache.prototype._wrap = function (value, ttl) {
            var now = Date.now();
            var currentTtl = typeof ttl === 'number' ? ttl : this.options.stdTTL;
            var livetime = currentTtl > 0 ? now + currentTtl : 0;
            return {
                v: value,
                t: livetime,
                n: now
            };
        };
        Cache.prototype._isLimited = function (len) {
            return this.options.max > -1 && len >= this.options.max;
        };
        Cache.prototype._getReplaceKey = function (keys, cacheValues) {
            var retkey = keys[0];
            keys.forEach(function (key) {
                if (cacheValues[key].t < cacheValues[retkey].t ||
                    (cacheValues[key].t === cacheValues[retkey].t && cacheValues[key].n < cacheValues[retkey].n)) {
                    retkey = key;
                }
            });
            return retkey;
        };
        Object.defineProperty(Cache.prototype, "cacheValues", {
            // 获取全部缓存数据，不处理过期数据和排序
            get: function () {
                return this.storage.get(this.cacheKey) || {};
            },
            enumerable: false,
            configurable: true
        });
        // 设置缓存数据
        Cache.prototype.setCacheValues = function (values) {
            this.storage.set(this.cacheKey, values);
        };
        // 从缓存中获取保存的值。如果未找到或已过期，则返回 undefined 。如果找到该值，则返回该值。
        Cache.prototype.get = function (key) {
            var data = this.cacheValues[key];
            if (data && this._check(key, data)) {
                return data.v;
            }
            return;
        };
        // 从缓存中获取多个保存的值。如果未找到或已过期，则返回一个空对象。如果找到该值，它会返回一个具有键值对的对象。
        Cache.prototype.mget = function (keys) {
            var _this = this;
            var ret = {};
            if (!Array.isArray(keys)) {
                return ret;
            }
            var cacheValues = this.cacheValues;
            keys.forEach(function (key) {
                var data = cacheValues[key];
                if (data && _this._check(key, data)) {
                    ret[key] = data.v;
                }
            });
            return ret;
        };
        // 从缓存中获取全部保存的值。返回一个具有键值对的对象。
        Cache.prototype.getAll = function () {
            var keys = Object.keys(this.cacheValues);
            return this.mget(keys);
        };
        // 设置键值对。设置成功返回 true 。
        Cache.prototype.set = function (key, value, ttl) {
            if (this.options.max === 0) {
                return false;
            }
            var cacheValues = this.cacheValues;
            var keys = Object.keys(cacheValues);
            // 当前不存在该键值，并且数据量超过最大限制
            if (!cacheValues[key] && this._isLimited(keys.length)) {
                var validKeys = this.keys();
                if (this._isLimited(validKeys.length)) {
                    // 如果最大限制策略是替换，将优先替换快过期的数据，如果都是一样的过期时间(0)，按照先入先出规则处理。
                    if (this.options.maxStrategy === 'replaced') {
                        var replaceKey = this._getReplaceKey(validKeys, cacheValues);
                        this.del(replaceKey);
                    }
                    else {
                        // 如果是最大限制策略是不允许添加，返回 false 。
                        return false;
                    }
                }
            }
            cacheValues[key] = this._wrap(value, ttl);
            this.setCacheValues(cacheValues);
            this.emit('set', key, cacheValues[key].v);
            return true;
        };
        // 设置多个键值对。全部设置成功返回 true 。
        Cache.prototype.mset = function (keyValueSet) {
            var _this = this;
            // 该处不使用数组 some 方法，是因为不能某个失败，而导致其他就不在更新。
            var ret = true;
            keyValueSet.forEach(function (item) {
                var itemSetResult = _this.set(item.key, item.value, item.ttl);
                if (ret && !itemSetResult) {
                    ret = false;
                }
            });
            return ret;
        };
        // 删除一个或多个键。返回已删除条目的数量。删除永远不会失败。
        Cache.prototype.del = function (key) {
            var _this = this;
            var cacheValues = this.cacheValues;
            var count = 0;
            var keys = Array.isArray(key) ? key : [key];
            keys.forEach(function (key) {
                if (cacheValues[key]) {
                    count++;
                    var oldData = cacheValues[key];
                    delete cacheValues[key];
                    _this.emit('del', key, oldData.v);
                }
            });
            if (count > 0) {
                this.setCacheValues(cacheValues);
            }
            return count;
        };
        // 删除当前所有缓存。
        Cache.prototype.clear = function () {
            this.storage.del(this.cacheKey);
        };
        // 返回所有现有键的数组。
        Cache.prototype.keys = function () {
            var _this = this;
            var cacheValues = this.cacheValues;
            var keys = Object.keys(cacheValues);
            return keys.filter(function (key) { return _this._check(key, cacheValues[key]); });
        };
        // 当前缓存是否包含某个键。
        Cache.prototype.has = function (key) {
            var data = this.cacheValues[key];
            return !!(data && this._check(key, data));
        };
        // 获取缓存值并从缓存中删除键。
        Cache.prototype.take = function (key) {
            var ret;
            var data = this.cacheValues[key];
            if (data && this._check(key, data)) {
                ret = data.v;
                this.del(key);
            }
            return ret;
        };
        // 重新定义一个键的 ttl 。如果找到并更新成功，则返回 true 。
        Cache.prototype.ttl = function (key, ttl) {
            var cacheValues = this.cacheValues;
            var data = cacheValues[key];
            if (data && this._check(key, data)) {
                cacheValues[key] = this._wrap(data.v, ttl);
                return true;
            }
            return false;
        };
        // 获取某个键的 ttl 。
        // 如果未找到键或已过期，返回 undefined 。
        // 如果 ttl 为 0 ，返回 0 。
        // 否则返回一个以毫秒为单位的时间戳，表示键值将过期的时间。
        Cache.prototype.getTtl = function (key) {
            var cacheValues = this.cacheValues;
            var data = cacheValues[key];
            if (data && this._check(key, data)) {
                return cacheValues[key].t;
            }
            return;
        };
        // 获取某个键值的最后修改时间
        // 如果未找到键或已过期，返回 undefined 。
        // 否则返回一个以毫秒为单位的时间戳，表示键值将过期的时间。
        Cache.prototype.getLastModified = function (key) {
            var cacheValues = this.cacheValues;
            var data = cacheValues[key];
            if (data && this._check(key, data)) {
                return cacheValues[key].n;
            }
            return;
        };
        // 启动定时校验过期数据
        Cache.prototype.startCheckperiod = function () {
            var _this = this;
            // 触发全部缓存数据是否过期校验
            this.keys();
            if (this.options.checkperiod > 0) {
                clearTimeout(this._checkTimeout);
                this._checkTimeout = setTimeout(function () {
                    _this.startCheckperiod();
                }, this.options.checkperiod);
            }
        };
        // 停止定时校验过期数据
        Cache.prototype.stopCheckperiod = function () {
            clearTimeout(this._checkTimeout);
        };
        return Cache;
    }(EmitterPro));

    new Storage(inWindow ? window.localStorage : undefined);

    new Storage(inWindow ? window.sessionStorage : undefined);

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
    var emitterStorage = new Cache('__private_cross_window_emitter__', {
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

}));
//# sourceMappingURL=cross-window-emitter.js.map
