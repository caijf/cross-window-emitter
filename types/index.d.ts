declare namespace crossWindowEmitter {
  type Fn = (...args: any) => any;

  /**
   * 注册事件
   * 
   * @param {string} eventName 事件名称
   * @param {function} listener 回调函数
   */
  export const on: (eventName: string, listener: Fn) => void;

  /**
   * 注册一次事件，执行后移除该监听方法
   * 
   * @param {string} eventName 事件名称
   * @param {function} listener 回调函数
   */
  export const once: (eventName: string, listerner: Fn) => void;

  /**
   * 解绑事件，如不传第二参数，将移除全部 eventName 的事件
   * 
   * @param {string} eventName 事件名称
   * @param {function} [listener] 回调函数
   */
  export const off: (eventName: string, listener?: Fn) => void;

  /**
   * 触发事件
   * 
   * @param {string} eventName 事件名称
   * @param {any} ...args 剩余参数用于传参
   */
  export const emit: (eventName: string, ...args?: any) => void;

  /**
   * 设置轮询时间
   * 
   * @param {string} eventName 事件名称
   * @param {number} pollingInterval 轮询时间，单位毫秒
   */
  export const setPollingInterval: (eventName: string, pollingInterval: number) => void;
}

export as namespace crossWindowEmitter;

export = crossWindowEmitter;
