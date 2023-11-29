import { createRenderer } from '../runtime-core'

/**
 * 创建DOM节点
 * @param type 元素类型
 * @returns {Element}
 */
function createElement(type: string) {
  return document.createElement(type)
}

/**
 * 更改属性
 */
function patchProp(el, prop, value) {
  const isOn = key => /^on[A-Z]/.test(key)
  if (isOn(prop)) {
    // 将事件处理函数存起来
    const invokers = el._vei || {}
    el._vei = invokers
    const existingInvoker = invokers[prop]
    const eventName = prop.slice(2).toLowerCase()
    if (existingInvoker) {
      // 已经绑定过事件，直接更改事件处理的函数体
      existingInvoker.value = value
    } else {
      const invoker = value
      invokers[prop] = invoker
      el.addEventListener(eventName, invoker)
    }
  } else {
    el.setAttribute(prop, value)
  }
}

/**
 * 注入DOM节点
 * @param {Element} el 子节点
 * @param {Element} parent 父节点
 */
function insert(el: Element, parent: Element, anchor: Element) {
  parent.insertBefore(el, anchor || null)
}

/**
 * 移除DOM节点
 * @param child DOM节点
 */
function remove(child: Element) {
  const parent = child.parentElement
  if (parent) {
    parent.removeChild(child)
  }
}

function setElementText(container, text) {
  container.textContent = text
}

const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert,
  remove,
  setElementText
})

export function createApp(...args) {
  return renderer.createApp(...args)
}

export * from '../runtime-core'
