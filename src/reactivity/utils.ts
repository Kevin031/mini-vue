/**
 * 传入的值是否为一个对象
 * @param {any} target
 * @returns
 */
export function isObject(target) {
  const type = typeof target
  return target !== null && (type === 'object' || type === 'function')
}

/**
 * 值有变化
 * @param {any} oldValue 旧的值
 * @param {any} newValue 新的值
 * @returns
 */
export function hasChanged(oldValue, newValue) {
  return !Object.is(oldValue, newValue)
}
