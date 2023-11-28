import { ShapeFlags } from '../shared/shapeFlags'

export function initSlots(instance, children) {
  const { vnode } = instance
  if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
    instance.slots = normalizeObjectSlots(children)
  }
}

function normalizeObjectSlots(children) {
  let slots = {}
  for (const key in children) {
    const value = children[key]
    if (typeof value === 'function') {
      slots[key] = data => normalizeSlotValue(value(data))
    } else {
      slots[key] = normalizeSlotValue(value)
    }
  }
  return slots
}

function normalizeSlotValue(value) {
  return Array.isArray(value) ? value : [value]
}
