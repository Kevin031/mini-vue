import { isObject } from '../shared/utils'
import { ShapeFlags } from '../shared/shapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { Fragment, Text } from './vnode'

/**
 * 挂载组件
 * @param vnode 虚拟DOM
 * @param container 容器
 */
function mountComponent(initialVNode, container) {
  // 获取组件实例
  const instance = createComponentInstance(initialVNode)
  // 执行setup方法
  setupComponent(instance)
  // 执行渲染effect
  setupRenderEffect(instance, container, initialVNode)
}

function processComponent(vnode, container) {
  mountComponent(vnode, container)
}

function processElement(vnode, container) {
  mountElement(vnode, container)
}

function processFragment(vnode, container) {
  mountChildren(vnode.children, container)
}

function processText(vnode, container) {
  mountTextNode(vnode, container)
}

function mountChildren(children, el) {
  children.forEach(vnode => {
    patch(vnode, el)
  })
}

/**
 * 渲染DOM元素
 * @param vnode 虚拟DOM
 * @param container 容器
 */
function mountElement(vnode, container) {
  const el = document.createElement(vnode.type)
  vnode.el = el
  const { children, shapeFlag } = vnode
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    // 渲染text children
    el.textContent = children
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    // 渲染array children
    mountChildren(children, el)
  }
  for (let prop in vnode.props) {
    const val = vnode.props[prop]
    const isOn = key => /^on[A-Z]/.test(key)
    if (isOn(prop)) {
      el.addEventListener(prop.slice(2).toLowerCase(), val)
    } else {
      el.setAttribute(prop, val)
    }
  }
  container.append(el)
}

/**
 * 渲染文本元素
 * @param vnode
 * @param container
 */
function mountTextNode(vnode, container) {
  const el = document.createTextNode(vnode.children)
  vnode.el = el
  container.append(el)
}

/**
 * 渲染组件的虚拟DOM
 * @param instance
 * @param container
 */
function setupRenderEffect(instance, container, initialVNode) {
  const { proxy } = instance
  const subTree = instance.render.call(proxy)
  patch(subTree, container)
  initialVNode.el = subTree.el
}

/**
 * 将VNode更新到DOM上
 * @param vnode
 * @param container
 */
function patch(vnode, container) {
  const { shapeFlag, type } = vnode

  switch (type) {
    case Fragment:
      processFragment(vnode, container)
      break
    case Text:
      processText(vnode, container)
      break
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        // 渲染普通节点
        processElement(vnode, container)
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        // 渲染组件
        processComponent(vnode, container)
      }
      break
  }
}

export function render(vnode, rootContainer) {
  // patch
  patch(vnode, rootContainer)
}
