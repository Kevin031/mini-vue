/**
 * 创建组件实例
 * @param {object} vnode 虚拟DOM
 * @returns {object} 组件实例
 */
export function createComponentInstance(vnode) {
  const component = {
    vnode,
  };
  return component;
}

/**
 * 创建有状态的组件
 * @param {object} instance 组件实例
 */
function setupStatefulComponent(instance) {}

function handleSetupResult(instance, setupResult) {
  if (typeof setupResult === "object") {
    instance.setupState = setupResult;
  }

  finishedComponentSetup(instance);
}

function finishedComponentSetup(instance) {
  const Component = instance.vnode.type;

  if (!instance.render) {
    instance.render = Component.render;
  }
}

/**
 * 初始化组件
 * @param {object} instance 组件实例
 */
export function setupComponent(instance) {
  // initProps
  const Component = instance.vnode?.type;
  const { setup } = Component;

  if (typeof setup === "function") {
    const setupResult = setup();
    handleSetupResult(instance, setupResult);
  }

  setupStatefulComponent(instance);
}
