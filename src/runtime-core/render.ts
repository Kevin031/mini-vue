import { isObject } from '../shared/utils'
import { ShapeFlags } from '../shared/shapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { Fragment, Text } from './vnode'
import { createAppAPI } from './createApp'
import { effect } from '../reactivity'

/**
 * 自定义渲染器
 * @param options
 */
export function createRenderer(options) {
  const { createElement, patchProp, insert } = options

  /**
   * 挂载组件
   * @param vnode 虚拟DOM
   * @param container 容器
   */
  function mountComponent(n1, n2, container, parent) {
    // 获取组件实例
    const initialVNode = n2
    const instance = createComponentInstance(initialVNode, parent)
    // 执行setup方法
    setupComponent(instance)
    // 执行渲染effect
    setupRenderEffect(instance, container, initialVNode)
  }

  function processComponent(n1, n2, container, parent) {
    mountComponent(n1, n2, container, parent)
  }

  function processElement(n1, n2, container, parent) {
    if (n1) {
      patchElememnt(n1, n2, container, parent)
    } else {
      mountElement(n2, container, parent)
    }
  }

  function processFragment(n1, n2, container, parent) {
    mountChildren(n2, container, parent)
  }

  function processText(n1, n2, container, parent) {
    mountTextNode(n2, container, parent)
  }

  function mountChildren(vnode, el, parent) {
    vnode.children.forEach(vnode => {
      patch(null, vnode, el, parent)
    })
  }

  function patchElememnt(n1, n2, container, parent) {
    console.log('patchElememnt', n1, n2)
  }

  /**
   * 渲染DOM元素
   * @param vnode 虚拟DOM
   * @param container 容器
   */
  function mountElement(vnode, container, parent) {
    const el = createElement(vnode.type)
    vnode.el = el
    const { children, shapeFlag } = vnode
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 渲染text children
      el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 渲染array children
      mountChildren(vnode, el, parent)
    }
    for (let prop in vnode.props) {
      const value = vnode.props[prop]
      patchProp(el, prop, value)
    }
    insert(el, container)
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
    effect(() => {
      const { proxy } = instance
      if (!instance.isMounted) {
        const subTree = instance.render.call(proxy)
        instance.subTree = subTree
        patch(null, subTree, container, instance)
        initialVNode.el = subTree.el
        instance.isMounted = true
      } else {
        const subTree = instance.render.call(proxy)
        const preSubTree = instance.subTree
        instance.subTree = subTree
        patch(preSubTree, subTree, container, instance)
      }
    })
  }

  /**
   * 将VNode更新到DOM上
   * @param vnode
   * @param container
   */
  function patch(n1, n2, container, parent) {
    const { shapeFlag, type } = n2

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parent)
        break
      case Text:
        processText(n1, n2, container, parent)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 渲染普通节点
          processElement(n1, n2, container, parent)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 渲染组件
          processComponent(n1, n2, container, parent)
        }
        break
    }
  }

  function render(vnode, rootContainer, parent) {
    // patch
    patch(null, vnode, rootContainer, parent)
  }

  return {
    createApp: createAppAPI(render)
  }
}
