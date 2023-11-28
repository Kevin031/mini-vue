import { createVNode } from '../vnode'
import { Fragment } from '../vnode'

export function renderSlots(slots, name = 'default', data) {
  const slot = slots[name]
  if (slot) {
    // 处理具名插槽
    let children = typeof slot === 'function' ? slot(data) : slot
    return createVNode(Fragment, null, children)
  } else {
    return null
  }
}
