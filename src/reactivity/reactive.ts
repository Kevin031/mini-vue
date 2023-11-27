import { mutationHandlers, readonlyHandlers } from './handlers'

export const ReactiveFlags = {
  IS_REACTIVE: '__v_isReactive',
  IS_READONLY: '__v_isReadOnly',
  IS_REF: '__v_isRef'
}

// 1. 监控数据的读写
// 2. 如何建立数据的对应关系

export function createReactiveObject(target, handlers) {
  return new Proxy(target, handlers)
}

/**
 * 将一个对象变成响应式
 * @param {*} target
 * @returns
 */
export function reactive(raw) {
  return createReactiveObject(raw, mutationHandlers)
}

export function readonly(raw) {
  return createReactiveObject(raw, readonlyHandlers)
}

/**
 * 判断一个对象是否为响应式数据
 */
export function isReactive(target) {
  return !!target[ReactiveFlags.IS_REACTIVE]
}

export function isReadOnly(target) {
  return !!target[ReactiveFlags.IS_READONLY]
}

export function isProxy(target) {
  return isReactive(target) || isReadOnly(target)
}
