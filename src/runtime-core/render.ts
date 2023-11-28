import { isObject } from '../shared/utils'
import { ShapeFlags } from '../shared/shapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { Fragment, Text } from './vnode'

/**
 * 挂载组件
 * @param vnode 虚拟DOM
 * @param container 容器
 */
function mountComponent(initialVNode, container, parent) {
  // 获取组件实例
  const instance = createComponentInstance(initialVNode, parent)
  // 执行setup方法
  setupComponent(instance)
  // 执行渲染effect
  setupRenderEffect(instance, container, initialVNode)
}

function processComponent(vnode, container, parent) {
  mountComponent(vnode, container, parent)
}

function processElement(vnode, container, parent) {
  mountElement(vnode, container, parent)
}

function processFragment(vnode, container, parent) {
  mountChildren(vnode.children, container, parent)
}

function processText(vnode, container, parent) {
  mountTextNode(vnode, container, parent)
}

function mountChildren(children, el, parent) {
  children.forEach(vnode => {
    patch(vnode, el, parent)
  })
}

/**
 * 渲染DOM元素
 * @param vnode 虚拟DOM
 * @param container 容器
 */
function mountElement(vnode, container, parent) {
  const el = document.createElement(vnode.type)
  vnode.el = el
  const { children, shapeFlag } = vnode
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    // 渲染text children
    el.textContent = children
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    // 渲染array children
    mountChildren(children, el, parent)
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
function mountTextNode(vnode, container, parent) {
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
  patch(subTree, container, instance)
  initialVNode.el = subTree.el
}

/**
 * 将VNode更新到DOM上
 * @param vnode
 * @param container
 */
function patch(vnode, container, parent) {
  const { shapeFlag, type } = vnode

  switch (type) {
    case Fragment:
      processFragment(vnode, container, parent)
      break
    case Text:
      processText(vnode, container, parent)
      break
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        // 渲染普通节点
        processElement(vnode, container, parent)
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        // 渲染组件
        processComponent(vnode, container, parent)
      }
      break
  }
}

export function render(vnode, rootContainer, parent) {
  // patch
  patch(vnode, rootContainer, parent)
}
