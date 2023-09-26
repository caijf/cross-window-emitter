(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("crossWindowEmitter", [], factory);
	else if(typeof exports === 'object')
		exports["crossWindowEmitter"] = factory();
	else
		root["crossWindowEmitter"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else { var mod; }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.setPollingInterval = _exports.once = _exports.on = _exports.off = _exports.emit = _exports["default"] = void 0;
  function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
  function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
  function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
  function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
  // 事件触发器缓存最长保留时间，轮询时间不能超过该时间一半
  var MAX_EMITTER_TIME = 30 * 60 * 1000;

  // 处理程序
  var handlers = {
    data: {},
    // 添加处理程序
    add: function add(eventName, listener) {
      if (!this.data[eventName]) {
        this.data[eventName] = [];
      }
      this.data[eventName].push({
        timestamp: Date.now(),
        // 注册或触发时间，如果该时间大于触发时间则不触发。
        fn: listener
      });
    },
    // 删除处理程序
    remove: function remove(eventName, listener) {
      if (this.data[eventName] && listener) {
        this.data[eventName] = this.data[eventName].filter(function (item) {
          return item.fn !== listener;
        });
      } else {
        this.data[eventName] = [];
      }
    },
    // 获取处理程序
    get: function get(eventName) {
      return eventName ? this.data[eventName] : this.data;
    },
    // 是否还有处理程序
    has: function has(eventName) {
      var eventList = this.get(eventName) || [];
      return eventList.length > 0;
    }
  };

  // 触发器缓存
  var emitterStorage = {
    // 缓存key
    key: "__private_cross_window_emitter__",
    // 获取缓存
    get: function get(eventName) {
      var tmpData = JSON.parse(window.localStorage.getItem(this.key)) || {};
      return eventName ? tmpData[eventName] : tmpData;
    },
    // 设置缓存
    set: function set(data) {
      window.localStorage.setItem(this.key, JSON.stringify(data));
    },
    // 添加数据
    add: function add(eventName) {
      var tmpData = this.get();
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      tmpData[eventName] = {
        timestamp: Date.now(),
        // 触发时间
        params: args || []
      };
      var keys = Object.keys(tmpData);
      keys.forEach(function (key) {
        if (Date.now() - tmpData[key] > MAX_EMITTER_TIME) {
          delete tmpData[key];
        }
      });
      this.set(tmpData);
    },
    // 删除数据
    remove: function remove(eventName) {
      var tmpData = this.get();
      if (eventName) {
        delete tmpData[eventName];
        this.set(tmpData);
      } else {
        window.localStorage.removeItem(this.key);
      }
    }
  };

  // 运行
  var run = function run(eventName) {
    var cb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};
    return function () {
      var curEmitter = emitterStorage.get(eventName);
      var curHandlers = handlers.get(eventName);
      if (curEmitter) {
        curHandlers.forEach(function (_ref, index) {
          var timestamp = _ref.timestamp,
            fn = _ref.fn;
          if (timestamp < curEmitter.timestamp) {
            cb();
            curHandlers[index].timestamp = Date.now(); // 更新执行时间
            fn.call.apply(fn, [null].concat(_toConsumableArray(curEmitter.params)));
          }
        });
      }
    };
  };

  // 轮询管理
  var polling = {
    data: {},
    // 开始轮询
    start: function start(eventName, fn) {
      var pollingInterval = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 500;
      if (!eventName) {
        return;
      }
      if (!this.data[eventName]) {
        this.data[eventName] = {
          timestamp: Date.now(),
          // 开始轮询时间
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
    stop: function stop(eventName) {
      if (!eventName || !this.data[eventName]) {
        return;
      }
      clearInterval(this.data[eventName].timer);
    },
    // 设置轮询时间
    setPollingInterval: function setPollingInterval(eventName) {
      var pollingInterval = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 500;
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
  var on = _exports.on = function on(eventName, listener) {
    handlers.add(eventName, listener);
    polling.start(eventName, run(eventName));
  };

  /**
   * 注册一次事件，执行后移除该监听方法
   * 
   * @param {string} eventName 事件名称
   * @param {function} listener 回调函数
   */
  var once = _exports.once = function once(eventName, listener) {
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
  var off = _exports.off = function off(eventName, listener) {
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
  var emit = _exports.emit = function emit(eventName) {
    for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }
    emitterStorage.add.apply(emitterStorage, [eventName].concat(args));
  };

  // // 销毁，全部取消轮询
  // const destroy = () => {
  //   const eventNames = Object.keys(handlers.get());
  //   eventNames.forEach(eventName => polling.stop(eventName));
  //   handlers.remove();
  // }

  /**
   * 设置轮询时间
   * 
   * @param {string} eventName 事件名称
   * @param {number} pollingInterval 轮询时间，单位毫秒
   */
  var setPollingInterval = _exports.setPollingInterval = function setPollingInterval(eventName, pollingInterval) {
    polling.setPollingInterval(eventName, pollingInterval);
  };
  var _default = _exports["default"] = {
    on: on,
    once: once,
    off: off,
    emit: emit,
    setPollingInterval: setPollingInterval
  };
});

/***/ })

/******/ });
});
//# sourceMappingURL=cross-window-emitter.js.map