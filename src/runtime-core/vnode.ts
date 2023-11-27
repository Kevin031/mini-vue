export function createVNode(type, props = null, children = null) {
  return {
    type,
    props,
    children,
    el: null
  }
}
