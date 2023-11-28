import { getCurrentInstance } from './component'

/**
 * 存：provide
 * @param key
 * @param value
 */
export const provide = (key, value) => {
  // console.log('provide - ', key, value)
  const currentInstance: any = getCurrentInstance()
  if (currentInstance) {
    let { provides } = currentInstance
    const parentProvides = currentInstance.parent.provides
    // init
    if (provides.__proto__ !== parentProvides) {
      provides = Object.create(parentProvides)
      currentInstance.provides = provides
    }
    provides[key] = value
  }
}

/**
 * 取：inject
 * @param key
 */
export const inject = (key, defaultValue) => {
  const currentInstance: any = getCurrentInstance()
  if (currentInstance) {
    const { parent } = currentInstance
    const parentProvides = parent.provides
    // console.log('inject - ', key, parentProvides[key], parent.provides)
    if (key in parentProvides) {
      return parentProvides[key]
    } else if (defaultValue) {
      if (typeof defaultValue === 'function') {
        return defaultValue()
      }
      return defaultValue
    }
  }
}
