const publicPropertiesMap = {
  $el: i => i.vnode.el,

  $data: i => i.setupState
}

export const publicInstancceProxyHnadlers = {
  get({ _: instance }, key) {
    const { setupState } = instance
    if (key in setupState) {
      return setupState[key]
    }
    const publicGetter = publicPropertiesMap[key]
    if (publicGetter) {
      return publicGetter(instance)
    }
  }
}
