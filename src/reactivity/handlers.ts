import { pauseTracking, resumeTracking, track, trigger } from "./effect";
import { TrackOptions, TriggerOptions } from "./operations";
import { hasChanged, isObject } from "./utils";
import { reactive, readonly, ReactiveFlags } from "./index";

let arrayInstrumentations = {};
["indexOf", "lastIndexOf", "includes"].forEach((key) => {
  arrayInstrumentations[key] = function (...args) {
    // 判断代理对象是否有值
    let result = Array.prototype[key].apply(this, args);
    // 找不到，再原始对象中再找一遍
    if (result < 0 || result === false) {
      result = Array.prototype[key].apply(this[TrackOptions.RAW], args);
    }
    return result;
  };
});

["push", "pop", "shift", "unshift", "splice"].forEach((key) => {
  arrayInstrumentations[key] = function (...args) {
    pauseTracking();
    let result = Array.prototype[key].apply(this, args);
    resumeTracking();
    return result;
  };
});

export const createGetter = (isReadOnly = false) => {
  /**
   * 读取属性
   * @param {*} target
   * @param {*} key
   * @param {*} receiver
   * @returns
   */
  return function get(target, key, receiver) {
    if (key === TrackOptions.RAW) {
      return target;
    }

    if (key === ReactiveFlags.IS_READONLY) {
      return isReadOnly;
    }

    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadOnly;
    }

    // 依赖收集
    if (!isReadOnly) {
      track(target, TrackOptions.GET, key);
    }

    if (arrayInstrumentations[key]) {
      return arrayInstrumentations[key];
    }

    // Reflect使用内部方法让this指向代理对象
    const result = Reflect.get(target, key, receiver);
    // 深度代理
    if (isObject(result)) {
      return isReadOnly ? readonly(result) : reactive(result);
    }
    return result;
  };
};

export const createSetter = () => {
  /**
   * 设置属性
   * @param {*} target
   * @param {*} key
   * @param {*} value
   * @param {*} receiver
   * @returns
   */
  return function (target, key, value, receiver) {
    const type = target.hasOwnProperty(key)
      ? TriggerOptions.SET
      : TriggerOptions.ADD;

    const oldLength = Array.isArray(target) ? target.length : undefined;

    const oldValue = target[key];
    const result = Reflect.set(target, key, value, receiver);

    if (!result) return result;

    const newLength = Array.isArray(target) ? target.length : undefined;

    // 值有变化或新增属性时派发更新
    if (hasChanged(oldValue, value) || type === TriggerOptions.ADD) {
      // 派发更新
      trigger(target, type, key, value);
      // 处理通过下标改变了数组的长度的情况
      // 设置了数组 && 设置前后length发生了变化 && 设置的不是length属性
      if (Array.isArray(target) && oldLength !== newLength) {
        if (key !== "length") {
          trigger(target, TriggerOptions.SET, "length", newLength);
        } else {
          // 找到被删除的下标，依次触发派发更新
          for (let i = newLength as number; i < (oldLength as number); i++) {
            trigger(target, TriggerOptions.DELETE, i.toString(), undefined);
          }
        }
      }
    }

    return result;
  };
};

/**
 * 是否存在属性
 * @param {*} target
 * @param {*} key
 * @returns
 */
export function has(target, key) {
  track(target, TrackOptions.HAS, key);
  return Reflect.has(target, key);
}

/**
 * 遍历属性
 * @param {*} target
 * @returns
 */
export function ownKeys(target) {
  track(target, TrackOptions.ITERATE, "");
  return Reflect.ownKeys(target);
}

/**
 * 删除属性
 * @param {*} target
 * @param {*} key
 * @returns
 */
export function deleteProperty(target, key) {
  const hasKey = target.hasOwnProperty(key);
  const result = Reflect.deleteProperty(target, key);
  if (hasKey && result) {
    trigger(target, TriggerOptions.DELETE, key, undefined);
  }
  return result;
}

export const mutationHandlers = {
  get: createGetter(),
  set: createSetter(),
  has,
  ownKeys,
  deleteProperty,
};

export const readonlyHandlers = {
  get: createGetter(true),

  set() {
    console.warn("can not call set to readonly");
    return true;
  },
};
