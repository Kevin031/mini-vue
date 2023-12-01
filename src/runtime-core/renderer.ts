import { ShapeFlags } from '../shared/shapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { Fragment, Text } from './vnode'
import { createAppAPI } from './createApp'
import { effect } from '../reactivity/src'
import { shouldUpdateComponent } from './componentUpdateUtils'
import { queueJobs } from './scheduler'

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
   * @param n1
   * @param n2
   * @param container
   * @param parentComponent
   */
  function mountComponent(n1, n2, container, parentComponent) {
    // 获取组件实例
    const initialVNode = n2
    const instance = createComponentInstance(initialVNode, parentComponent)
    initialVNode.component = instance
    // 执行setup方法
    setupComponent(instance)
    // 执行渲染effect
    setupRenderEffect(instance, container, initialVNode)
  }

  /**
   * 更新组件
   * @param n1
   * @param n2
   * @param container
   * @param parentComponent
   */
  function updateComponent(n1, n2) {
    const instance = n1.component
    n2.component = instance
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2
      instance.update()
    } else {
      n2.el = n1.el
      instance.vnode = n2
    }
  }

  function updateComponentPreRender(instance, nextVNode) {
    instance.vnode = nextVNode
    instance.next = null
    instance.props = nextVNode.props
  }

  function processComponent(n1, n2, container, parentComponent) {
    if (n1) {
      updateComponent(n1, n2)
    } else {
      mountComponent(n1, n2, container, parentComponent)
    }
  }

  function processElement(n1, n2, container, parentComponent, anchor = null) {
    if (n1) {
      patchElement(n1, n2, container, parentComponent, anchor)
    } else {
      mountElement(n2, container, parentComponent, anchor)
    }
  }

  function processFragment(n1, n2, container, parentComponent) {
    mountChildren(n2, container, parentComponent)
  }

  function processText(n1, n2, container, parentComponent) {
    mountTextNode(n2, container, parentComponent)
  }

  function mountChildren(vnode, el, parentComponent = null) {
    vnode.children.forEach(vnode => {
      patch(null, vnode, el, parentComponent, null)
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

  function patchNoKeyedChildren(c1, c2, container, parentComponent, anchor) {
    // 比较数组子元素
    const commonLength = Math.min(c1.length, c2.length)
    // 修改
    for (let i = 0; i < commonLength; i++) {
      patchElement(c1[i], c2[i], container)
    }
    // 新增
    if (c2.length > c1.length) {
      for (let i = c1.length; i < c2.length; i++) {
        mountElement(c2[i], container, parentComponent, anchor)
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
   * 比较数组执行更新
   * 1. 增
   * 2. 删
   * 3. 改
   * 4. 排序
   * @param c1 旧的子节点数组
   * @param c2 新的子节点数组
   * @param container 容器element
   * @param parentComponent 父组件实例
   * @param parentAnchor 锚点
   */
  function patchKeyedChildren(
    c1,
    c2,
    container,
    parentComponent,
    parentAnchor
  ) {
    let i = 0
    let l1 = c1.length
    let l2 = c2.length
    let e1 = l1 - 1
    let e2 = l2 - 1

    function isSameVNodeType(n1, n2) {
      return n1.type === n2.type && n1.key === n2.key
    }

    // 左->右
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }
      i++
    }

    // 右->左
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }
      e1--
      e2--
    }

    // 新的比老的多，创建
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1
        const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor)
          i++
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        hostRemove(c1[i].el)
        i++
      }
    }
  }

  /**
   * 对比子节点的vnode，更新DOM节点
   * @param n1
   * @param n2
   * @param el
   * @param parentComponent
   */
  function patchChildren(n1, n2, container, parentComponent, anchor = null) {
    const { shapeFlag: prevShapeFlag, children: c1 } = n1
    const { shapeFlag, children: c2 } = n2
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // array children->text
        unmountChildren(c1)
        hostSetElementText(container, c2)
      } else {
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
        // patchNoKeyedChildren(c1, c2, container, parentComponent)
        patchKeyedChildren(c1, c2, container, parentComponent, anchor)
      }
    }
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
   * @param parentComponent 父组件实例
   */
  function patchElement(
    n1,
    n2,
    container,
    parentComponent = null,
    anchor = null
  ) {
    // 对比元素类型是否相同
    const el = n1.el
    if (n1.type === n2.type) {
      n2.el = el
      // 深度优先
      // 对比子元素
      patchChildren(n1, n2, el, parentComponent, anchor)
      // 对比props
      patchProps(n1, n2, el)
    } else {
      // 类型不一致，重新创建节点
      unmountChildren([el])
      mountElement(n2, container, parentComponent, anchor)
    }
  }

  /**
   * 渲染DOM节点
   * @param vnode 虚拟DOM
   * @param container 容器
   * @param parentComponent 父组件实例
   */
  function mountElement(vnode, container, parentComponent, anchor) {
    const el = hostCreateElement(vnode.type)
    vnode.el = el
    const { children, shapeFlag } = vnode
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 渲染text children
      el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 渲染array children
      mountChildren(vnode, el, parentComponent)
    }
    for (let prop in vnode.props) {
      const value = vnode.props[prop]
      hostPatchProp(el, prop, value)
    }
    hostInsert(el, container, anchor)
  }

  /**
   * 渲染文本元素
   * @param vnode
   * @param container
   */
  function mountTextNode(vnode, container, parentComponent) {
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
    instance.update = effect(
      () => {
        const { proxy } = instance
        if (!instance.isMounted) {
          const subTree = instance.render.call(proxy)
          instance.subTree = subTree
          patch(null, subTree, container, instance, null)
          initialVNode.el = subTree.el
          instance.isMounted = true
        } else {
          // 需要一个更新后的vnode
          const { next, vnode } = instance
          if (next) {
            next.el = vnode.el
            updateComponentPreRender(instance, next)
          }
          const subTree = instance.render.call(proxy)
          const preSubTree = instance.subTree
          instance.subTree = subTree
          patch(preSubTree, subTree, container, instance, null)
        }
      },
      {
        scheduler() {
          queueJobs(instance.update)
        }
      }
    )
  }

  /**
   * 将VNode更新到DOM上
   * @param vnode
   * @param container
   */
  function patch(n1, n2, container, parentComponent, anchor) {
    const { shapeFlag, type } = n2

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent)
        break
      case Text:
        processText(n1, n2, container, parentComponent)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 渲染普通节点
          processElement(n1, n2, container, parentComponent, anchor)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 渲染组件
          processComponent(n1, n2, container, parentComponent)
        }
        break
    }
  }

  function render(vnode, rootContainer) {
    // patch
    patch(null, vnode, rootContainer, null, null)
  }

  return {
    createApp: createAppAPI(render)
  }
}
