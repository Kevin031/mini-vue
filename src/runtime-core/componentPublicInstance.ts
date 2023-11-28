const publicPropertiesMap = {
  $el: i => i.vnode.el,

  $data: i => i.setupState,

  $slots: i => i.slots
}

const hasOwn = (target, key) =>
  Object.prototype.hasOwnProperty.call(target, key)

export const publicInstancceProxyHnadlers = {
  get({ _: instance }, key) {
    const { setupState, props } = instance
    if (hasOwn(setupState, key)) {
      return setupState[key]
    }
    if (hasOwn(props, key)) {
      return props[key]
    }
    const publicGetter = publicPropertiesMap[key]
    if (publicGetter) {
      return publicGetter(instance)
    }
  }
}
