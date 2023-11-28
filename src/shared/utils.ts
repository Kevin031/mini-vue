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

/**
 * 转换为驼峰命名
 * @param str
 */
export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c: string) => {
    return c ? c.toUpperCase() : ''
  })
}

/**
 * 首字母大写
 * @param str
 * @returns
 */
export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * 事件转成on开头的写法
 * @param str
 * @returns
 */
export const toHandlerKey = (str: string) => {
  return str ? 'on' + capitalize(str) : ''
}
