import { ShapeFlags } from '../shared/shapeFlags'
import { isObject } from '../shared/utils'

export function getShapeFlag(type) {
  return typeof type === 'string'
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT
}

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')

export function createVNode(type, props: any = {}, children: any = null) {
  const vnode = {
    type,
    props: props || {},
    children,
    key: props ? props.key : undefined,
    shapeFlag: getShapeFlag(type),
    el: null
  }

  if (typeof children === 'string') {
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.TEXT_CHILDREN
  } else if (Array.isArray(children)) {
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.ARRAY_CHILDREN
  }

  // 组件 + children object
  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if (isObject(children)) {
      vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.SLOT_CHILDREN
    }
  }

  return vnode
}

export function createTextNode(text: string) {
  return createVNode(Text, null, text)
}
