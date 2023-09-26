# cross-window-emitter

> 由于 `native` 开发不提供 `webview` 激活时的钩子方法，特研究该方案。可应用于同域跨 `webview` 事件触发。

同域跨窗口事件触发器，通过轮询和 `localStorage` 实现。

[点击查看示例](https://caijf.github.io/cross-window-emitter/example/index.html)

## 安装

```shell
npm install cross-window-emitter
```

```shell
yarn add cross-window-emitter
```

```shell
pnpm add cross-window-emitter
```

**浏览器引入**

在浏览器中使用 `script` 标签直接引入文件，并使用全局变量 `crossWindowEmitter` 。

`npm` 包的 `cross-window-emitter/dist` 目录下提供了 `cross-window-emitter.js` 以及 `cross-window-emitter.min.js`。你也可以通过 [UNPKG](https://unpkg.com/cross-window-emitter@latest/dist/) 进行下载。

## 使用

**window 1 page**

```javascript
import crossWindowEmitter from 'cross-window-emitter';

crossWindowEmitter.on('update', () => {
  console.log('update');
});
```

**window 2 page**

```javascript
import crossWindowEmitter from 'cross-window-emitter';

crossWindowEmitter.emit('update');
```

## API

### on(eventName, listener)

> - eventName &lt;string&gt; | &lt;symbol&gt; 事件名称。
> - listener &lt;Function&gt; 回调函数。

添加 `listener` 函数到名为 `eventName` 的事件的监听器数组的末尾。 不会检查 `listener` 是否已被添加。 多次调用并传入相同的 `eventName` 与 `listener` 会导致 `listener` 会被添加多次。

```javascript
crossWindowEmitter.on('update', () => {
  console.log('update');
});
```

### once(eventName, listener)

> - `eventName` &lt;string&gt; | &lt;symbol&gt; 事件名称。
> - `listener` &lt;Function&gt; 回调函数。

添加单次监听器 `listener` 到名为 `eventName` 的事件。 当 `eventName` 事件下次触发时，监听器会先调用，然后再被移除。

如果 `eventName` 事件为空，将自动停止轮询。

```javascript
crossWindowEmitter.once('update', () => {
  console.log('update');
});
```

### off(eventName[, listener])

> - `eventName` &lt;string&gt; | &lt;symbol&gt; 事件名称。
> - `listener` &lt;Function&gt; 回调函数。

从名为 `eventName` 的事件的监听器数组中移除指定的 `listener` 。

如果没有传入 `listener`，将移除全部 `eventName` 事件。

```javascript
function callback(value) {
  // ...
}
crossWindowEmitter.on('update', callback);
// ...
crossWindowEmitter.off('update');
```

### emit(eventName[, ...args])

> - eventName &lt;string&gt; | &lt;symbol&gt;
> - ...args &lt;any&gt;

按照监听器注册的顺序，同步地调用每个注册到名为 `eventName` 的事件的监听器，并传入提供的参数。

每次调用会检查是否有缓存超过 30 分钟的 `eventName`，超时将自动清除。

### setPollingInterval(eventName, pollingInterval)

> - eventName &lt;string&gt; | &lt;symbol&gt;
> - pollingInterval &lt;number&gt;

设置当前窗口名为 `eventName` 的事件轮询调用时间，`pollingInterval` 不能超过 15 分钟，否则自动修正为 15 分钟。
