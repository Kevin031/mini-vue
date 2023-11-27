import { isObject } from '../reactivity/utils'
import { createComponentInstance, setupComponent } from './component'

/**
 * 挂载组件
 * @param vnode 虚拟DOM
 * @param container 容器
 */
function mountComponent(vnode, container) {
  // 获取组件实例
  const instance = createComponentInstance(vnode)
  // 执行setup方法
  setupComponent(instance)
  // 执行渲染effect
  setupRenderEffect(instance, container, vnode)
}

function processComponent(vnode, container) {
  mountComponent(vnode, container)
}

function processElement(vnode, container) {
  mountElement(vnode, container)
}

function mountChildren(children, el) {
  children.forEach(vnode => {
    patch(vnode, el)
  })
}

/**
 * 挂载元素
 * @param vnode 虚拟DOM
 * @param container 容器
 */
function mountElement(vnode, container) {
  const el = document.createElement(vnode.type)
  vnode.el = el
  const { children } = vnode
  if (typeof children === 'string') {
    el.textContent = children
  } else if (Array.isArray(children)) {
    mountChildren(children, el)
  } else {
    mountChildren([children], el)
  }
  for (let prop in vnode.props) {
    const val = vnode.props[prop]
    el.setAttribute(prop, val)
  }
  container.append(el)
}

/**
 * 渲染组件的虚拟DOM
 * @param instance
 * @param container
 */
function setupRenderEffect(instance, container, vnode) {
  const { proxy } = instance
  const subTree = instance.render.call(proxy)
  patch(subTree, container)
  vnode.el = subTree.el
}

/**
 * 将VNode更新到DOM上
 * @param vnode
 * @param container
 */
function patch(vnode, container) {
  // 判断vnode是不是一个element
  if (typeof vnode.type === 'string') {
    processElement(vnode, container)
  } else if (isObject(vnode)) {
    processComponent(vnode, container)
  } else {
    //
  }
}

export function render(vnode, rootContainer) {
  // patch
  patch(vnode, rootContainer)
}