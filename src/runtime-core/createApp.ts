import { createVNode } from "./vnode";
import { render } from "./render";

export function createApp(rootComponent, rootContainer) {
  return {
    mount() {
      const vnode = createVNode(rootComponent);

      render(vnode, rootContainer);
    },
  };
}
