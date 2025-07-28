import { Cache } from 'cache2';

type Listener = (...args: any[]) => any;

// 事件触发器缓存最长保留时间，轮询时间不能超过该时间一半
const MAX_EMITTER_TIME = 30 * 60 * 1000;

// 处理程序
const handlers = {
  data: {} as Record<string, { fn: Listener; timestamp: number }[]>,

  // 添加处理程序
  add(eventName: string, listener: Listener) {
    if (!this.data[eventName]) {
      this.data[eventName] = [];
    }
    this.data[eventName].push({
      timestamp: Date.now(), // 注册或触发时间，如果该时间大于触发时间则不触发。
      fn: listener
    });
  },

  // 删除处理程序
  remove(eventName: string, listener?: Listener) {
    if (this.data[eventName] && listener) {
      this.data[eventName] = this.data[eventName].filter((item) => item.fn !== listener);
    } else {
      this.data[eventName] = [];
    }
  },

  // 获取处理程序
  get(eventName: string) {
    return this.data[eventName] || [];
  },

  // 是否还有处理程序
  has(eventName: string) {
    const eventList = this.get(eventName);
    return eventList.length > 0;
  }
};

// 触发器缓存
const emitterStorage = new Cache<{ timestamp: number; params: any[] }>(
  '__private_cross_window_emitter__',
  {
    stdTTL: MAX_EMITTER_TIME,
    storage: window.localStorage
  }
);

// 运行
const run = (eventName: string, cb?: () => void) => {
  return () => {
    const curEmitter = emitterStorage.get(eventName);
    const curHandlers = handlers.get(eventName);

    if (curEmitter) {
      curHandlers.forEach(({ timestamp, fn }, index) => {
        if (timestamp < curEmitter.timestamp) {
          cb?.();
          curHandlers[index].timestamp = Date.now(); // 更新执行时间
          // eslint-disable-next-line prefer-spread
          fn.apply(null, curEmitter.params);
        }
      });
    }
  };
};

// 轮询管理
const polling = {
  data: {} as Record<string, { timestamp: number; pollingInterval: number; timer: any }>,

  // 开始轮询
  start(eventName: string, fn: () => void, pollingInterval = 500) {
    if (!eventName) {
      return;
    }

    if (!this.data[eventName]) {
      this.data[eventName] = {
        timestamp: Date.now(), // 开始轮询时间
        pollingInterval,
        timer: null
      };
    }

    const curPolling = this.data[eventName];
    curPolling.pollingInterval = pollingInterval;
    clearInterval(curPolling.timer);
    curPolling.timer = setInterval(fn, pollingInterval);
  },

  // 停止轮询
  stop(eventName: string) {
    if (!eventName || !this.data[eventName]) {
      return;
    }
    clearInterval(this.data[eventName].timer);
  },

  // 设置轮询时间
  setPollingInterval(eventName: string, pollingInterval = 500) {
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
};

/**
 * 注册事件
 *
 * @param {string} eventName 事件名称
 * @param {function} listener 回调函数
 */
const on = (eventName: string, listener: Listener) => {
  handlers.add(eventName, listener);
  polling.start(eventName, run(eventName));
};

/**
 * 注册一次事件，执行后移除该监听方法
 *
 * @param {string} eventName 事件名称
 * @param {function} listener 回调函数
 */
const once = (eventName: string, listener: Listener) => {
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
};

/**
 * 解绑事件，如不传第二参数，将移除全部 eventName 的事件
 *
 * @param {string} eventName 事件名称
 * @param {function} [listener] 回调函数
 */
const off = (eventName: string, listener?: Listener) => {
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
const emit = (eventName: string, ...args: any[]) => {
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
const setPollingInterval = (eventName: string, pollingInterval: number) => {
  polling.setPollingInterval(eventName, pollingInterval);
};

export { on, once, off, emit, setPollingInterval };
