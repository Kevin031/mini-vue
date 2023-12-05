# mini-vue

一个实现了最小闭环的Vue源码，包含了以下4个模块

```
|-src
  |-reactivity 响应式数据，提供ref, reactive, computed, watch等api
  |-runtime-core 运行时核心流程，包含了组件从初始化到渲染的的完整生命周期
  |-runtime-dom 提供接入浏览器DOM的能力
  |-compiler-core 编译核心，把template转换成render函数
```
