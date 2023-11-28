import { createVNode } from './vnode'

export function createAppAPI(render) {
  return function createApp(rootComponent) {
    return {
      mount(rootContainer) {
        const vnode = createVNode(rootComponent)

        render(
          vnode,
          typeof rootContainer === 'string'
            ? document.querySelector(rootContainer)
            : rootContainer,
          null
        )
      }
    }
  }
}
