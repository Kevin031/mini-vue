import reactive from "./reactive/index.js";
import { effect } from "./reactive/effect.js";
import computed from "./reactive/computed.js";

const data = {};

const obj = {
  a: 1,
  b: 2,
  c: 3,
  // get c() {
  //   return this.a + this.b;
  // },
  d: {
    e: 3,
  },
  arr: [1, 2, 3, data],
};
const state = reactive(obj);

function obs() {
  // 读取属性
  // state.a;
  // 对象代理
  // console.log(state.c);
  // 对象深度遍历
  // console.log(state.d.e);
  // 读取属性信息
  // console.log("a" in state);
  // 迭代器
  // for (const key in state) {
  // }
  // 新增属性
  // state.f = 1;
  // state.f = 1;
  // state.f = 2;
  // 读取属性
  // state.f;
  // // 重复读取
  // state.f;
  // 删除属性
  // delete state.f;
  // 删除不存在的属性
  // delete state.g;
  // 数组收集
  // state.arr;
  // state.arr.length;
  // for (let i in state.arr) {
  //   state.arr[i];
  // }
  // for (let val of state.arr) {
  //   val;
  // }
  // state.arr.includes(1);
  // state.arr.indexOf(1);
  // state.arr.lastIndexOf(1);
  // 通过下标更改了数组的长度
  // state.arr[5] = 2;
  // state.arr.length = 3;
  // 调用了数组的方法
  // state.arr.push("10");
  // state.arr.pop();
  // state.arr.splice(1, 0, 999);
}

// effect(obs);

// function fn1() {
//   console.log("调用fn1");
//   state.a;
//   for (let item of state.arr) {
//   }
// }
// function fn2() {
//   console.log("fn2");
//   if (state.a === 1) {
//     state.b;
//   } else {
//     state.c;
//   }
// }

// function fn() {
//   console.log("outer");
//   state.a;

//   effect(() => {
//     console.log("inner");
//     state.b;
//   });
// }

// function fn() {
//   console.log("fn");
//   state.a++;
// }

// effect(fn);
// effect(fn1);
// effect(fn2);

// obs();

// state.a = 2;
// state.b = 3;
// state.c = 4;
// state.arr.push(1);
// console.log(proxy.a);

const sum = computed(() => {
  console.log("computed");
  return state.a + state.b;
});

effect(() => {
  console.log("sum", sum.value);
});

state.a++;
