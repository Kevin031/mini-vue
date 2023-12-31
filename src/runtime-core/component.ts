import { publicInstancceProxyHnadlers } from './componentPublicInstance'
import { initProps } from './componentProps'
import { initSlots } from './componentSlots'
import { shallowReadonly } from '../reactivity/src'
import { emit } from './componentEmit'
import { proxyRefs } from '../reactivity/src'

/**
 * 调用setup的时候，指向当前的组件
 */
let currentInstance = null

/**
 * 创建组件实例
 * @param {object} vnode 虚拟DOM
 * @param {object} parent 父组件的实例
 * @returns {object} 组件实例
 */
export function createComponentInstance(vnode, parent) {
  // console.log('parent', parent)
  const component = {
    vnode,
    type: vnode.type,
    props: {},
    slots: {},
    setupState: {},
    parent,
    provides: {},
    emit: () => {},
    isMounted: false
  }

  component.emit = emit.bind(null, component) as any

  return component
}

/**
 * 创建有状态的组件
 * @param {object} instance 组件实例
 */
function setupStatefulComponent(instance) {
  const Component = instance.type
  const { setup } = Component
  if (typeof setup === 'function') {
    setCurrentInstance(instance)
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit
    })
    setCurrentInstance(null)
    handleSetupResult(instance, setupResult)
  }
  instance.proxy = new Proxy({ _: instance }, publicInstancceProxyHnadlers)
}

function handleSetupResult(instance, setupResult) {
  if (typeof setupResult === 'object') {
    instance.setupState = proxyRefs(setupResult)
  }

  finishedComponentSetup(instance)
}

function finishedComponentSetup(instance) {
  const Component = instance.vnode.type

  if (!instance.render) {
    instance.render = Component.render
  }
}

/**
 * 初始化组件
 * @param {object} instance 组件实例
 */
export function setupComponent(instance) {
  initProps(instance, instance.vnode.props)
  initSlots(instance, instance.vnode.children)
  setupStatefulComponent(instance)
}

export function getCurrentInstance() {
  return currentInstance
}

export function setCurrentInstance(instance) {
  currentInstance = instance
}
