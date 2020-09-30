type Fn = (...args: any) => any;

/**
 * 注册事件
 * 
 * @param {string} eventName 事件名称
 * @param {function} listener 回调函数
 */
declare const on: (eventName: string, listener: Fn) => void;

/**
 * 注册一次事件，执行后移除该监听方法
 * 
 * @param {string} eventName 事件名称
 * @param {function} listener 回调函数
 */
declare const once: (eventName: string, listerner: Fn) => void;

/**
 * 解绑事件，如不传第二参数，将移除全部 eventName 的事件
 * 
 * @param {string} eventName 事件名称
 * @param {function} [listener] 回调函数
 */
declare const off: (eventName: string, listener?: Fn) => void;

/**
 * 触发事件
 * 
 * @param {string} eventName 事件名称
 * @param {any} ...args 剩余参数用于传参
 */
declare const emit: (eventName: string, ...args?: any) => void;

/**
 * 设置轮询时间，默认500毫秒
 * 
 * @param {string} eventName 事件名称
 * @param {number} pollingInterval 轮询时间，单位毫秒
 */
declare const setPollingInterval: (eventName: string, pollingInterval: number) => void;

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
}