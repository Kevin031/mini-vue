import { createRenderer } from '../runtime-core'

function createElement(type) {
  return document.createElement(type)
}

function patchProp(el, prop, value) {
  const isOn = key => /^on[A-Z]/.test(key)
  if (isOn(prop)) {
    el.addEventListener(prop.slice(2).toLowerCase(), value)
  } else {
    el.setAttribute(prop, value)
  }
}

function insert(el, parent) {
  parent.append(el)
}

const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert
})

export function createApp(...args) {
  return renderer.createApp(...args)
}

export * from '../runtime-core'
