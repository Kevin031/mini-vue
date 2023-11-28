import { isObject } from '../reactivity/utils'
import { ShapeFlags } from '../shared/shapeFlags'
import { createComponentInstance, setupComponent } from './component'

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
    el.setAttribute(prop, val)
  }
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
  if (vnode.shapeFlag & ShapeFlags.ELEMENT) {
    // 渲染普通节点
    processElement(vnode, container)
  } else if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    // 渲染组件
    processComponent(vnode, container)
  }
}

export function render(vnode, rootContainer) {
  // patch
  patch(vnode, rootContainer)
}
