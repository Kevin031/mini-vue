import { createComponentInstance, setupComponent } from "./component";

function mountComponent(vnode, container) {
  const instance = createComponentInstance(vnode);

  setupComponent(instance);
  setupRenderEffect(instance, container);
}

function setupRenderEffect(instance, container) {
  const subTree = instance.render();
}

function processComponent(vnode, container) {
  mountComponent(vnode, container);
}

function patch(vnode, container) {
  processComponent(vnode, container);
}

export function render(vnode, rootContainer) {
  // patch
  patch(vnode, rootContainer);
}
