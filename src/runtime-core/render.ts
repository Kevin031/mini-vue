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
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText
  } = options

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
      patchElement(n1, n2, container, parent)
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

  function mountChildren(vnode, el, parent = null) {
    vnode.children.forEach(vnode => {
      patch(null, vnode, el, parent)
    })
  }

  /**
   * 更新DOM节点属性
   * @param n1 旧的vnode
   * @param n2 新的vnode
   * @param el 当前DOM元素
   * @param container 容器
   */
  function patchProps(n1, n2, el) {
    const oldProps = n1.props
    const newProps = n2.props
    for (let prop in newProps) {
      const value = newProps[prop]
      hostPatchProp(el, prop, value)
    }
    // 删除props
    for (let prop in oldProps) {
      if (!(prop in newProps)) {
        el.removeAttribute(prop)
      }
    }
  }

  function patchNoKeyedChildren(c1, c2, container, parent) {
    // 比较数组子元素
    const commonLength = Math.min(c1.length, c2.length)
    // 修改
    for (let i = 0; i < commonLength; i++) {
      debugger
      patchElement(c1[i], c2[i], container)
    }
    // 新增
    if (c2.length > c1.length) {
      for (let i = c1.length; i < c2.length; i++) {
        mountElement(c2[i], container, parent)
      }
    }
    // 删除
    if (c2.length < c1.length) {
      c1.slice(c2.length).forEach(child => {
        const parentNode = child.el.parentNode
        parentNode.removeChild(child.el)
      })
    }
  }

  /**
   * 对比子节点的vnode，更新DOM节点
   * @param n1
   * @param n2
   * @param el
   * @param parent
   */
  function patchChildren(n1, n2, container, parent) {
    const { shapeFlag: prevShapeFlag, children: c1 } = n1
    const { shapeFlag, children: c2 } = n2
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        debugger
        // array children->text
        unmountChildren(c1)
        hostSetElementText(container, c2)
      } else {
        debugger
        // text->text
        if (c1 !== c2) {
          hostSetElementText(container, c2)
        }
      }
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // text->array children
        hostSetElementText(container, '')
        mountChildren(n2, container)
      } else {
        // array children->array children
        // console.log('对比children', c1, c2)
        // for (let i = c2; i < c2.legnth; i++) {
        //   patchElement(c1[i], c2[i], container)
        // }
        patchNoKeyedChildren(c1, c2, container, parent)
        // patchKeyedChildren(c1, c2, container)
      }
    }
    // // 修改children
    // const oldChildren = n1.children
    // const newChildren = n2.children
    // if (typeof newChildren === 'string') {
    //   if (typeof oldChildren === 'string') {
    //     if (newChildren !== oldChildren) {
    //       el.textContent = newChildren
    //     }
    //   } else {
    //     el.textContent = newChildren
    //   }
    // } else if (Array.isArray(oldChildren) && Array.isArray(newChildren)) {
    //   // 比较数组子元素
    //   const commonLength = Math.min(oldChildren.length, newChildren.length)
    //   // 修改
    //   for (let i = 0; i < commonLength; i++) {
    //     patchElement(oldChildren[i], newChildren[i], el, parent)
    //   }
    //   // 新增和删除
    //   if (newChildren.length > oldChildren.length) {
    //     for (let i = oldChildren.length; i < newChildren.length; i++) {
    //       mountElement(newChildren[i], container, parent)
    //     }
    //   }
    //   if (newChildren.length < oldChildren.length) {
    //     oldChildren
    //       .slice(newChildren.length)
    //       .forEach(child => el.removeChild(child))
    //   }
  }

  function unmountChildren(children) {
    for (let i = 0; i < children.legnth; i++) {
      const el = children[i]
      hostRemove(el)
    }
  }

  /**
   * 对比vnode，更新DOM节点
   * @param n1 旧的vnode
   * @param n2 新的vnode
   * @param container 容器
   * @param parent 父组件实例
   */
  function patchElement(n1, n2, container, parent = null) {
    // 对比元素类型是否相同
    const el = n1.el
    if (n1.type === n2.type) {
      n2.el = el
      // 深度优先
      // 对比子元素
      patchChildren(n1, n2, el, parent)
      // 对比props
      patchProps(n1, n2, el)
    } else {
      // 类型不一致，重新创建节点
      unmountChildren([el])
      mountElement(n2, container, parent)
    }
  }

  /**
   * 渲染DOM节点
   * @param vnode 虚拟DOM
   * @param container 容器
   * @param parent 父组件实例
   */
  function mountElement(vnode, container, parent) {
    const el = hostCreateElement(vnode.type)
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
      hostPatchProp(el, prop, value)
    }
    hostInsert(el, container)
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
