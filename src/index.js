// 事件触发器缓存最长保留时间，轮询时间不能超过该时间一半
const MAX_EMITTER_TIME = 30 * 60 * 1000;

// 处理程序
const handlers = {
  data: {},

  // 添加处理程序
  add(eventName, listener) {
    if (!this.data[eventName]) {
      this.data[eventName] = [];
    }
    this.data[eventName].push({
      timestamp: Date.now(), // 注册或触发时间，如果该时间大于触发时间则不触发。
      fn: listener
    })
  },

  // 删除处理程序
  remove(eventName, listener) {
    if (!this.data[eventName]) {
      this.data[eventName] = [];
    }

    if (listener) {
      this.data[eventName] = this.data[eventName].filter(item => item.fn !== listener);
    } else {
      this.data[eventName] = [];
    }
  },

  // 获取处理程序
  get(eventName) {
    return eventName ? this.data[eventName] : this.data;
  },

  // 是否还有处理程序
  has(eventName) {
    const eventList = this.get(eventName) || [];
    return eventList.length > 0;
  }
};

// 触发器缓存
const emitterStorage = {
  // 缓存key
  key: "__private_cross_window_emitter__",

  // 获取缓存
  get(eventName) {
    const tmpData = JSON.parse(window.localStorage.getItem(this.key)) || {};
    return eventName ? tmpData[eventName] : tmpData;
  },

  // 设置缓存
  set(data) {
    window.localStorage.setItem(this.key, JSON.stringify(data));
  },

  // 添加数据
  add(eventName, ...args) {
    const tmpData = this.get();

    tmpData[eventName] = {
      timestamp: Date.now(), // 触发时间
      params: args || []
    }

    const keys = Object.keys(tmpData);

    keys.forEach(key => {
      if (Date.now() - tmpData[key] > MAX_EMITTER_TIME) {
        delete tmpData[key]
      }
    });

    this.set(tmpData);
  },

  // 删除数据
  remove(eventName) {
    const tmpData = this.get();

    if (eventName) {
      delete tmpData[eventName];
      this.set(tmpData);
    } else {
      window.localStorage.removeItem(this.key);
    }
  }
}

// 运行
const run = (eventName, cb = () => { }) => {
  return () => {
    const curEmitter = emitterStorage.get(eventName);
    const curHandlers = handlers.get(eventName);

    if (curEmitter) {
      curHandlers.forEach(({ timestamp, fn }, index) => {
        if (timestamp < curEmitter.timestamp) {
          cb();
          curHandlers[index].timestamp = Date.now(); // 更新执行时间
          fn.call(null, ...curEmitter.params);
        }
      })
    }
  }
}

// 轮询管理
const polling = {
  data: {},

  // 开始轮询
  start(eventName, fn, pollingInterval = 500) {
    if (!eventName) {
      return;
    }

    if (!this.data[eventName]) {
      this.data[eventName] = {
        timestamp: Date.now(), // 开始轮询时间
        pollingInterval,
        timer: null
      }
    }

    const curPolling = this.data[eventName];
    curPolling.pollingInterval = pollingInterval;
    clearInterval(curPolling.timer);
    curPolling.timer = setInterval(fn, pollingInterval);
  },

  // 停止轮询
  stop(eventName) {
    if (!eventName || !this.data[eventName]) {
      return;
    }
    clearInterval(this.data[eventName].timer);
  },

  // 设置轮询时间
  setPollingInterval(eventName, pollingInterval = 500) {
    if (!eventName || !this.data[eventName] || !pollingInterval) {
      return;
    }

    if (pollingInterval > MAX_EMITTER_TIME / 2) {
      console.warn(`polling interval no more than ${MAX_EMITTER_TIME}.`);
      pollingInterval = MAX_EMITTER_TIME / 2;
    }

    const curPolling = this.data[eventName];

    clearInterval(curPolling.timer);
    this.start(eventName, run(eventName), pollingInterval);
  }
}

// 注册事件
const on = (eventName, listener) => {
  handlers.add(eventName, listener);
  polling.start(eventName, run(eventName));
}

// 注册一次事件，执行后移除该监听方法
const once = (eventName, listener) => {
  let isRun = false; // 标识是否运行过函数
  handlers.add(eventName, listener);
  polling.start(eventName, () => {
    if (isRun) {
      handlers.remove(eventName, listener); // 移除该监听方法

      if (!handlers.has(eventName)) {
        polling.stop(eventName); // 如果没有处理程序，停止轮询
      }
    }

    run(eventName, () => {
      isRun = true;
    })();
  });
}

// 解绑事件
const off = (eventName, listener) => {
  handlers.remove(eventName, listener);

  if (!handlers.has(eventName)) {
    polling.stop(eventName);
  }
}

// 触发事件
const emit = (eventName, ...args) => {
  emitterStorage.add(eventName, ...args);
}

// // 销毁，全部取消轮询
// const destroy = () => {
//   const eventNames = Object.keys(handlers.get());
//   eventNames.forEach(eventName => polling.stop(eventName));
//   handlers.remove();
// }

// 设置轮询间隔时间
const setPollingInterval = (eventName, pollingInterval) => {
  polling.setPollingInterval(eventName, pollingInterval);
}

export {
  on,
  once,
  off,
  emit,
  setPollingInterval
}

export default {
  on,
  once,
  off,
  emit,
  setPollingInterval
};
