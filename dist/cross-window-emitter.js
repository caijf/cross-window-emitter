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
    /* global Reflect, Promise, SuppressedError, Symbol, Iterator */

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

    /**
     * 事件触发器，支持浏览器端和 node 端。
     *
     * @class
     * @example
     *
     * const emitter = new Emitter();
     *
     * // 注册监听方法
     * emitter.on('foo', () => console.log('foo 1'));
     * emitter.on('foo', () => console.log('foo 2'));
     *
     * // 触发方法
     * emitter.emit('foo');
     * // foo 1
     * // foo 2
     *
     * // 取消监听方法
     * emitter.off('foo');
     *
     * // 支持链式调用
     * emitter.on('foo', () => {})
     *  .on('foo', () => {})
     *  .off('foo');
     */
    var EmitterPro = /** @class */ (function () {
        function EmitterPro() {
            this.handlers = {};
        }
        /**
         * 获取全部事件名称。
         *
         * @returns 事件名称数组。
         * @example
         * emitter.on('foo', () => {});
         * emitter.on('bar', () => {});
         *
         * emitter.eventNames(); // ['foo', 'bar']
         */
        EmitterPro.prototype.eventNames = function () {
            var _a;
            var symbols = ((_a = Object.getOwnPropertySymbols) === null || _a === void 0 ? void 0 : _a.call(Object, this.handlers)) || [];
            var keys = Object.keys(this.handlers);
            return keys.concat(symbols);
        };
        /**
         * 获取事件名称的全部监听方法（原始方法，未经过包装处理）。
         *
         * @param eventName 事件名称
         * @returns 对应事件名称的监听方法数组
         * @example
         * const fn1 = () => console.log('bar');
         * const fn2 = () => console.log('baz');
         *
         * emitter.on('test', fn1);
         * emitter.once('test', fn2);
         *
         * emitter.rawListeners('test'); // [fn1, fn2]
         */
        EmitterPro.prototype.rawListeners = function (eventName) {
            var handler = this.handlers[eventName];
            return handler ? handler.map(function (item) { return item.raw; }) : [];
        };
        /**
         * 获取事件名称的全部监听方法（如通过 `once` 方法注册，返回的是包装方法）。
         *
         * @param eventName 事件名称
         * @returns 对应事件名称的监听方法数组
         * @example
         * const fn1 = () => console.log('bar');
         * const fn2 = () => console.log('baz');
         *
         * emitter.on('test', fn1);
         * emitter.once('test', fn2);
         *
         * emitter.rawListeners('test'); // [fn1, wrapFn2]
         */
        EmitterPro.prototype.listeners = function (eventName) {
            var handler = this.handlers[eventName];
            return handler ? handler.map(function (item) { return item.wrap; }) : [];
        };
        /**
         * 判断事件名称对应的监听方法是否存在。
         *
         * @param eventName 事件名称
         * @param listener 监听方法
         * @returns 如果事件名称存在该事件方法返回 `true`，否则返回 `false`。
         * @example
         * const fn1 = () => console.log('bar');
         * const fn2 = () => console.log('baz');
         *
         * emitter.on('test', fn1);
         * emitter.once('test', fn2);
         *
         * emitter.hasListener('test', fn1); // true
         * emitter.hasListener('test', fn2); // true
         *
         * // fn2 是通过 once 方法注册，执行一次后自动解绑
         * emitter.emit('test');
         *
         * emitter.hasListener('test', fn1); // true
         * emitter.hasListener('test', fn2); // false
         */
        EmitterPro.prototype.hasListener = function (eventName, listener) {
            return this.rawListeners(eventName).some(function (item) { return item === listener; });
        };
        EmitterPro.prototype._on = function (eventName, raw, wrap, context, dir) {
            if (context === void 0) { context = null; }
            if (dir === void 0) { dir = 1; }
            var currentListener = { raw: raw, wrap: wrap, context: context };
            if (!this.handlers[eventName]) {
                this.handlers[eventName] = [currentListener];
            }
            else {
                var appendMethod = dir === 1 ? 'push' : 'unshift';
                this.handlers[eventName][appendMethod](currentListener);
            }
            return this;
        };
        /**
         * 注册监听方法。同 `on` 方法，只是将监听方法添加到最前面（事件触发是按顺序执行）。
         *
         * @param eventName 事件名称
         * @param listener 监听方法
         * @param context 执行上下文
         * @returns 事件触发器实例。
         * @example
         * emitter.on('foo', () => console.log('bar'));
         * emitter.prependListener('foo', () => console.log(42));
         *
         * emitter.emit('foo');
         * // 42
         * // bar
         */
        EmitterPro.prototype.prependListener = function (eventName, listener, context) {
            return this._on(eventName, listener, listener, context, 0);
        };
        /**
         * 注册监听方法。允许多次添加同一引用的函数。
         *
         * @param eventName 事件名称
         * @param listener 监听方法
         * @param context 执行上下文
         * @returns 事件触发器实例。
         * @example
         * emitter.on('foo', () => console.log('bar'));
         * emitter.on('foo', () => console.log(42));
         *
         * emitter.emit('foo');
         * // bar
         * // 42
         */
        EmitterPro.prototype.on = function (eventName, listener, context) {
            return this._on(eventName, listener, listener, context);
        };
        EmitterPro.prototype._wrapOnce = function (eventName, listener, context) {
            var _this = this;
            if (context === void 0) { context = null; }
            var wrap = (function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                listener.apply(context, args);
                _this.off(eventName, wrap);
            });
            return wrap;
        };
        /**
         * 仅触发一次的监听方法。使用方法同 `on` 。
         *
         * @param eventName 事件名称
         * @param listener 监听方法
         * @param context 执行上下文
         * @returns 事件触发器实例。
         * @example
         * emitter.on('foo', () => console.log('bar'));
         * emitter.once('foo', () => console.log(42));
         *
         * emitter.emit('foo');
         * // bar
         * // 42
         *
         * emitter.emit('foo');
         * // bar
         */
        EmitterPro.prototype.once = function (eventName, listener, context) {
            var wrap = this._wrapOnce(eventName, listener, context);
            return this._on(eventName, listener, wrap, context);
        };
        /**
         * 仅触发一次的监听方法。同 `once` 方法，只是添加到最前面（事件触发是按顺序执行）。
         *
         * @param eventName 事件名称
         * @param listener 监听方法
         * @param context 执行上下文
         * @returns 事件触发器实例。
         * @example
         * emitter.on('foo', () => console.log('bar'));
         * emitter.prependOnceListener('foo', () => console.log(42));
         *
         * emitter.emit('foo');
         * // 42
         * // bar
         *
         * emitter.emit('foo');
         * // bar
         */
        EmitterPro.prototype.prependOnceListener = function (eventName, listener, context) {
            var wrap = this._wrapOnce(eventName, listener, context);
            return this._on(eventName, listener, wrap, context, 0);
        };
        /**
         * 取消监听方法。如果不传第二个参数，将取消该事件名称的全部监听方法。如果多次添加同一引用的函数，需要多次删除。
         *
         * @param eventName 事件名称
         * @param listener 监听方法
         * @returns 事件触发器实例。
         * @example
         * const fn = () => console.log('bar');
         * emitter.on('foo', fn);
         * emitter.on('foo', () => console.log('baz'));
         * emitter.on('foo', () => console.log(42));
         *
         * emitter.emit('foo');
         * // bar
         * // baz
         * // 42
         *
         * emitter.off('foo', fn); // 取消 foo 的监听方法 fn
         *
         * emitter.emit('foo');
         * // bar
         * // 42
         *
         * emitter.off('foo'); // 取消 foo 的全部监听方法
         * emitter.emit('foo'); // 什么都没发生
         */
        EmitterPro.prototype.off = function (eventName, listener) {
            var handler = this.handlers[eventName];
            if (handler) {
                if (listener) {
                    var index = handler.findIndex(function (item) { return item.wrap === listener || item.raw === listener; });
                    if (index !== -1) {
                        handler.splice(index, 1);
                    }
                }
                else {
                    delete this.handlers[eventName];
                }
            }
            return this;
        };
        /**
         * 取消全部事件名称的监听方法。
         *
         * @returns 事件触发器实例。
         * @example
         * const fn = () => console.log('bar');
         * emitter.on('test', fn);
         * emitter.on('test', () => console.log('baz'));
         * emitter.on('test', () => console.log(42));
         *
         * emitter.on('other', fn);
         * emitter.on('other', () => console.log('baz'));
         *
         * emitter.emit('test');
         * // bar
         * // baz
         * // 42
         *
         * emitter.emit('other');
         * // bar
         * // baz
         *
         * emitter.offAll(); // 取消全部监听方法
         *
         * emitter.emit('test'); // 什么都没发生
         * emitter.emit('other'); // 什么都没发生
         */
        EmitterPro.prototype.offAll = function () {
            this.handlers = {};
            return this;
        };
        /**
         * 触发监听方法。
         *
         * @param eventName 事件名称
         * @param args 触发监听方法的参数（从第二个参数开始都将传给监听方法）
         * @returns 如果触发成功返回 `true`，否则返回 `false`。
         * @example
         * emitter.on('foo', () => console.log('bar'));
         * emitter.on('foo', () => console.log(42));
         *
         * emitter.emit('foo');
         * // bar
         * // 42
         *
         * // 支持传入参数
         * emitter.on('test' (a, b) => console.log(a + b));
         * emitter.on('test' (a, b) => console.log(a * b));
         *
         * emitter.emit('other', 2, 5);
         * // 7
         * // 10
         *
         * emitter.emit('other', 5, 5);
         * // 10
         * // 25
         */
        EmitterPro.prototype.emit = function (eventName) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var handler = this.handlers[eventName];
            if (handler && handler.length > 0) {
                handler.forEach(function (listener) {
                    listener.wrap.apply(listener.context, args);
                });
                return true;
            }
            return false;
        };
        return EmitterPro;
    }());

    var cache = {};
    var MemoryStorage = /** @class */ (function () {
        function MemoryStorage(scope) {
            if (scope === void 0) { scope = 'default'; }
            this.scope = scope;
            if (!cache[this.scope]) {
                cache[this.scope] = {};
            }
            this.data = cache[this.scope];
        }
        MemoryStorage.prototype.getItem = function (key) {
            return key in this.data ? this.data[key] : null;
        };
        MemoryStorage.prototype.setItem = function (key, value) {
            this.data[key] = value;
        };
        MemoryStorage.prototype.removeItem = function (key) {
            delete this.data[key];
        };
        MemoryStorage.prototype.clear = function () {
            cache[this.scope] = {};
            this.data = cache[this.scope];
        };
        return MemoryStorage;
    }());

    // 随机字符串
    function randomString() {
        return Math.random().toString(16).substring(2, 8);
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
                var key = randomString() + new Date().getTime();
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

    /**
     * 数据存储管理。
     *
     * @class
     * @param {Object} [storage] 自定义缓存对象要包含 `getItem` `setItem` `removeItem` 方法。默认使用内存缓存。
     * @param {Object} [options] 配置项。可选。
     * @param {boolean} [options.needParsed] 存取数据时是否需要序列化和解析数据。如果使用内置的内存缓存，默认 `false`，如果自定义 `storage` 默认 `true`。
     * @param {Function} [options.replacer] 数据存储时序列化的参数，透传给 [JSON.stringify](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) 的 `replacer` 参数。仅在 `needParsed=true` 时生效。
     * @param {Function} [options.reviver] 数据获取时转换的参数，透传给 [JSON.parse](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse) 的 `reviver` 参数。仅在 `needParsed=true` 时生效。
     * @param {string} [options.prefix] 缓存键前缀。便于管理同域名下的不同项目缓存。
     * @example
     * // 使用内存缓存
     * const memory = new Storage();
     * memory.set('foo', { baz: 42 });
     * memory.get('foo');
     * // { baz: 42 }
     *
     * // 自定义缓存 sessionStorage 。
     * const session = new Storage(window.sessionStorage);
     * session.set('foo', { a: 1, b: ['bar'], c: ['x', 2, 3] });
     * session.get('foo');
     * // { a: 1, b: ['bar'], c: ['x', 2, 3] }
     *
     * session.del('foo'); // 删除缓存
     * session.get('foo');
     * // null
     *
     * // 使用缓存键前缀。
     * // 如果要使用内存缓存， storage 传 `undefined`。
     * const local = new Storage(window.localStorage, { prefix: 'project_name' });
     * local.set('foo', { baz: 42 });
     * local.get('foo');
     * // { baz: 42 }
     */
    var Storage = /** @class */ (function () {
        function Storage(storage, options) {
            if (options === void 0) { options = {}; }
            var isSupported = storage ? isStorageSupported(storage) : false;
            this.options = __assign({ needParsed: isSupported, prefix: '' }, options);
            this.storage = isSupported ? storage : new MemoryStorage(this.options.memoryScope);
        }
        /**
         * 内部用于获取存储的键名称。
         *
         * 如果实例有设置 `prefix`，返回 `prefix + key`。
         *
         * @protected
         * @param key 原键名称
         * @returns 存储的键名称
         */
        Storage.prototype.getKey = function (key) {
            return this.options.prefix + key;
        };
        /**
         * 获取存储的数据。
         *
         * @param {string} key 键名称。
         * @returns 如果键值存在返回键值，否则返回 `null`。
         * @example
         * const local = new Storage(window.localStorage);
         * local.set('foo', { baz: 42 });
         * local.get('foo');
         * // { baz: 42 }
         */
        Storage.prototype.get = function (key) {
            var value = this.storage.getItem(this.getKey(key));
            return this.options.needParsed ? parse(value, this.options.reviver) : value;
        };
        /**
         * 存储数据。
         *
         * @param key 键名称。
         * @param value 键值。
         * @example
         * const local = new Storage(window.localStorage);
         * local.set('foo', { baz: 42 });
         * local.get('foo');
         * // { baz: 42 }
         */
        Storage.prototype.set = function (key, value) {
            this.storage.setItem(this.getKey(key), this.options.needParsed ? stringify(value, this.options.replacer) : value);
        };
        /**
         * 删除存储的数据。
         *
         * @param key 键名称。
         * @example
         * const local = new Storage(window.localStorage);
         * local.set('foo', { baz: 42 });
         * local.get('foo');
         * // { baz: 42 }
         *
         * local.del('foo');
         * local.get('foo');
         * // null
         */
        Storage.prototype.del = function (key) {
            this.storage.removeItem(this.getKey(key));
        };
        /**
         * 清除存储的所有键。
         *
         * 注意：该方法调用 `storage.clear()`，可能会将同域下的不同实例的所有键都清除。如果要避免这种情况，建议使用 `import { Cache } 'cache2'`。
         *
         * @example
         * const local = new Storage(window.localStorage);
         * local.set('foo', { baz: 42 });
         * local.get('foo');
         * // { baz: 42 }
         *
         * local.clear();
         * local.get('foo');
         * // null
         */
        Storage.prototype.clear = function () {
            if (typeof this.storage.clear === 'function') {
                this.storage.clear();
            }
        };
        return Storage;
    }());

    // 命名空间缓存键前缀。
    var defaultPrefix = 'cache2_';
    var defaultNamespace = 'default';
    /**
     * 功能丰富的数据存储管理，支持 `自定义缓存` `命名空间` `数据过期时间` `限制缓存数量` `自定义事件`。
     *
     * 注意：如果你需要的是简单的基本数据存储管理，例如浏览器存储，建议使用 `import { Storage } from 'cache2'`。
     *
     * @class
     * @param {string} [namespace] 命名空间。可选。
     * @param {Object} [options] 配置项。可选。
     * @param {Object} [options.storage] 自定义缓存对象要包含 `getItem` `setItem` `removeItem` 方法。默认使用内置的内存缓存。
     * @param {number} [options.max=-1] 最大缓存数据数量。`-1` 表示无限制。默认 `-1`。
     * @param {'limited' | 'replaced'} [options.maxStrategy='limited'] 当达到最大缓存数量限制时的缓存策略。`limited` 表示达到限制数量后不存入数据，保存时返回 `false`。`replaced` 表示优先替换快过期的数据，如果都是一样的过期时间(0)，按照先入先出规则处理，保存时始终返回 `true`。默认 `limited`。
     * @param {number} [options.stdTTL=0] 相对当前时间的数据存活时间，应用于当前实例的所有缓存数据。单位为毫秒，`0` 表示无期限。默认 `0`。
     * @param {number} [options.checkperiod=0] 定时检查过期数据，单位毫秒。如果小于等于 `0` 表示不启动定时器检查。默认 `0`。
     * @param {boolean} [options.needParsed] 存取数据时是否需要序列化和解析数据。如果使用内置的内存缓存，默认 `false`，如果自定义 `storage` 默认 `true`。
     * @param {Function} [options.replacer] 数据存储时序列化的参数，透传给 [JSON.stringify](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) 的 `replacer` 参数。仅在 `needParsed=true` 时生效。
     * @param {Function} [options.reviver] 数据获取时转换的参数，透传给 [JSON.parse](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse) 的 `reviver` 参数。仅在 `needParsed=true` 时生效。
     * @param {string} [options.prefix] 缓存键前缀。
     * @example
     * // 自定义过期时间
     * const memoryCache = new Cache({ stdTTL: 60 * 1000 });
     * memoryCache.set('foo', { baz: 42 });
     * memoryCache.get('foo');
     * // { baz: 42 }
     *
     * // 60 seconds later
     *
     * memoryCache.get('foo');
     * // undefined
     *
     * // 命名空间、自定义缓存
     * const localCache = new Cache('namespace', { storage: window.localStorage });
     * localCache.set('foo', { baz: 42 });
     * localCache.get('foo');
     * // { baz: 42 }
     *
     * localCache.del('foo');
     * localCache.get('foo');
     * // undefined
     */
    var Cache = /** @class */ (function (_super) {
        __extends(Cache, _super);
        function Cache(namespace, options) {
            var _this = _super.call(this) || this;
            var ns = defaultNamespace, opts;
            if (typeof namespace === 'string') {
                ns = namespace || defaultNamespace;
            }
            else if (typeof namespace === 'object') {
                opts = namespace;
            }
            if (!opts && typeof options === 'object') {
                opts = options;
            }
            _this.options = __assign({ max: -1, stdTTL: 0, maxStrategy: 'limited', checkperiod: 0, prefix: defaultPrefix }, opts);
            _this.storage = new Storage(_this.options.storage, __assign({ memoryScope: ns }, _this.options));
            _this.cacheKey = ns;
            _this.startCheckperiod();
            return _this;
        }
        /**
         * 检查当前键值是否过期，如果过期将会自动删除。
         *
         * @param key 键名称。
         * @param data 缓存数据。
         * @returns 如果键值已过期返回 `false` ，否则返回 `true`。
         */
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
            /**
             * 获取全部缓存数据，不处理过期数据和排序
             */
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
        /**
         * 获取缓存值。
         *
         * @param {string} key 键名称。
         * @returns {*} 如果找到该值，则返回该值。如果未找到或已过期，则返回 `undefined`。
         * @example
         * myCache.set('myKey', obj, 5 * 60 * 1000);
         * myCache.get('myKey');
         * // { foo: 'bar', baz: 42 }
         *
         * myCache.get('myKey2');
         * // undefined
         */
        Cache.prototype.get = function (key) {
            var data = this.cacheValues[key];
            if (data && this._check(key, data)) {
                return data.v;
            }
            return;
        };
        /**
         * 获取多个缓存值。
         *
         * @param {string[]} keys 多个键名称。
         * @returns {Object} 如果找到对应键名的值，返回一个具有键值对的对象。如果未找到或已过期，则返回一个空对象 `{}`。
         * @example
         * myCache.mset([
         *   { key: 'myKey', value: { foo: 'bar', baz: 42 }, ttl: 5 * 60 * 1000 },
         *   { key: 'myKey2', value: { a: 1, b: 2 } },
         *   { key: 'myKey3', value: 'abc' }
         * ]);
         *
         * myCache.mget(['myKey', 'myKey2']);
         * // {
         * //   myKey: { foo: 'bar', baz: 42 },
         * //   myKey2: { a: 1, b: 2 }
         * // }
         */
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
        /**
         * 获取全部缓存值。
         *
         * @returns {Object} 返回一个具有键值对的对象。
         * @example
         * myCache.mset([
         *   { key: 'myKey', value: { foo: 'bar', baz: 42 }, ttl: 5 * 60 * 1000 },
         *   { key: 'myKey2', value: { a: 1, b: 2 } },
         *   { key: 'myKey3', value: 'abc' }
         * ]);
         *
         * myCache.getAll();
         * // {
         * //   myKey: { foo: 'bar', baz: 42 },
         * //   myKey2: { a: 1, b: 2 }
         * //   myKey3: 'abc'
         * // }
         */
        Cache.prototype.getAll = function () {
            var keys = Object.keys(this.cacheValues);
            return this.mget(keys);
        };
        /**
         * 设置缓存数据。
         *
         * 如果超出缓存数量，可能会设置失败。
         *
         * @param {string} key 键名称。
         * @param {*} value 键值。
         * @param {number} [ttl] 数据存活时间。单位毫秒 `ms`。
         * @returns {boolean} 如果设置成功返回 `true`，否则返回 `false`。
         * @example
         * myCache.set('myKey', { foo: 'bar', baz: 42 }, 5 * 60 * 1000);
         * // true
         */
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
        /**
         * 设置多个缓存数据。
         *
         * @param {Object[]} keyValueSet 多个键值对数据。
         * @returns {boolean} 如果全部设置成功返回 `true`，否则返回 `false`。
         * @example
         * myCache.mset([
         *   { key: 'myKey', value: { foo: 'bar', baz: 42 }, ttl: 5 * 60 * 1000 },
         *   { key: 'myKey2', value: { a: 1, b: 2 } },
         *   { key: 'myKey3', value: 'abc' }
         * ]);
         * // true
         */
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
        /**
         * 删除一个或多个键。
         *
         * @param {string|string[]} key 要删除的键名。
         * @returns {number} 返回已删除的数量。
         * @example
         * myCache.set('myKey', { foo: 'bar', baz: 42 });
         * myCache.del('myKey'); // 1
         * myCache.del('not found'); // 0
         *
         * myCache.mset([
         *   { key: 'myKey', value: { foo: 'bar', baz: 42 }, ttl: 5 * 60 * 1000 },
         *   { key: 'myKey2', value: { a: 1, b: 2 } },
         *   { key: 'myKey3', value: 'abc' }
         * ]);
         * myCache.del(['myKey', 'myKey2']); // 2
         */
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
        /**
         * 清除全部缓存的数据。
         *
         * @example
         * myCache.set('bar', 1);
         * myCache.set('foo', 2);
         * myCache.keys(); // ['bar', 'foo']
         *
         * myCache.clear();
         * myCache.keys(); // []
         */
        Cache.prototype.clear = function () {
            this.storage.del(this.cacheKey);
        };
        /**
         * 获取全部键名的数组。
         *
         * @returns {string[]} 返回全部键名的数组。
         * @example
         * myCache.set('bar', 1);
         * myCache.set('foo', 2);
         *
         * myCache.keys(); // ['bar', 'foo']
         */
        Cache.prototype.keys = function () {
            var _this = this;
            var cacheValues = this.cacheValues;
            var keys = Object.keys(cacheValues);
            return keys.filter(function (key) { return _this._check(key, cacheValues[key]); });
        };
        /**
         * 判断是否存在某个键。
         *
         * @param {string} key 键名称。
         * @returns {boolean} 如果包含该键返回 `true`，否则返回 `false`。
         * @example
         * myCache.has('foo'); // false
         *
         * myCache.set('foo', 1);
         * myCache.has('foo'); // true
         */
        Cache.prototype.has = function (key) {
            var data = this.cacheValues[key];
            return !!(data && this._check(key, data));
        };
        /**
         * 获取缓存值并从缓存中删除键。
         *
         * @param {string} key 键名称。
         * @returns {*} 如果找到该值，则返回该值，并从缓存中删除该键。如果未找到或已过期，则返回 `undefined`。
         * @example
         * myCache.set('myKey', 'myValue');
         * myCache.has('myKey'); // true
         *
         * myCache.take('myKey'); // 'myValue'
         * myCache.has('myKey'); // false
         */
        Cache.prototype.take = function (key) {
            var ret;
            var data = this.cacheValues[key];
            if (data && this._check(key, data)) {
                ret = data.v;
                this.del(key);
            }
            return ret;
        };
        /**
         * 更新缓存键值的数据存活时间。
         *
         * @param {string} key 键名称。
         * @param {number} ttl 数据存活时间。
         * @returns {boolean} 如果找到并更新成功，则返回 `true`，否则返回 `false`。
         * @example
         * myCache.set('myKey', { foo: 'bar', baz: 42 }, 5 * 60 * 1000);
         * myCache.ttl('myKey', 60 * 1000);
         * // true
         *
         * myCache.ttl('not found', 1000);
         * // false
         */
        Cache.prototype.ttl = function (key, ttl) {
            var cacheValues = this.cacheValues;
            var data = cacheValues[key];
            if (data && this._check(key, data)) {
                cacheValues[key] = this._wrap(data.v, ttl);
                return true;
            }
            return false;
        };
        /**
         * 获取某个键的过期时间戳。
         *
         * @param {string} key 键名称。
         * @returns {number | undefined} 如果未找到键或已过期，返回 `undefined`。如果 `ttl` 为 `0`，返回 `0`，否则返回一个以毫秒为单位的时间戳，表示键值将过期的时间。
         * @example
         * const myCache = new Cache({ stdTTL: 5 * 1000 });
         *
         * // 假如 Date.now() = 1673330000000
         * myCache.set('ttlKey', 'expireData');
         * myCache.set('noTtlKey', 'nonExpireData', 0);
         *
         * myCache.getTtl('ttlKey'); // 1673330005000
         * myCache.getTtl('noTtlKey'); // 0
         * myCache.getTtl('unknownKey'); // undefined
         */
        Cache.prototype.getTtl = function (key) {
            var cacheValues = this.cacheValues;
            var data = cacheValues[key];
            if (data && this._check(key, data)) {
                return cacheValues[key].t;
            }
            return;
        };
        /**
         * 获取某个键值的最后修改时间。
         *
         * @param {string} key 键名称。
         * @returns {number | undefined} 如果未找到键或已过期，返回 `undefined`，否则返回一个以毫秒时间戳，表示键值最后修改时间。
         * @example
         * const myCache = new Cache();
         *
         * // 假如 Date.now() = 1673330000000
         * myCache.set('myKey', 'foo');
         * myCache.getLastModified('myKey'); // 1673330000000
         *
         * // 5000ms later
         * myCache.set('myKey', 'bar');
         * myCache.getLastModified('myKey'); // 1673330005000
         */
        Cache.prototype.getLastModified = function (key) {
            var cacheValues = this.cacheValues;
            var data = cacheValues[key];
            if (data && this._check(key, data)) {
                return cacheValues[key].n;
            }
            return;
        };
        /**
         * 启动定时校验过期数据。
         *
         * 注意，如果没有设置 `checkperiod` 将不会触发定时器。
         *
         * @example
         * // 设置 checkperiod 之后自动生效
         * const myCache = new Cache({
         *   checkperiod: 10 * 60 * 1000 // 10分钟检查一次数据是否过期
         * });
         *
         * // 停止定时校验过期数据
         * myCache.stopCheckperiod();
         *
         * // 启动定时校验过期数据
         * myCache.startCheckperiod();
         */
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
        /**
         * 停止定时校验过期数据。
         *
         * @example
         * // 设置 checkperiod 之后自动生效
         * const myCache = new Cache({
         *   checkperiod: 10 * 60 * 1000 // 10分钟检查一次数据是否过期
         * });
         *
         * // 停止定时校验过期数据
         * myCache.stopCheckperiod();
         */
        Cache.prototype.stopCheckperiod = function () {
            clearTimeout(this._checkTimeout);
        };
        return Cache;
    }(EmitterPro));

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
