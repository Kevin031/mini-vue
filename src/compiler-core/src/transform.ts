import { NodeTypes } from './ast'
import { TO_DISPLAY_STRING } from './runtime-helpers'

export function transform(root, options = {}) {
  const context = createTransformContext(root, options)
  // 深度优先搜索
  // 修改text content
  traverseNode(context.root, context)
  // root.codegenNode
  createRootCodegen(root)
  root.helpers = [...context.helpers.keys()]
}

function createRootCodegen(root) {
  const child = root.children[0]
  if (child.type === NodeTypes.ElEMENT) {
    root.codegenNode = child.codegenNode
  } else {
    root.codegenNode = root.children[0]
  }
}

function createTransformContext(root, options) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],
    helpers: new Map(),
    helper(key) {
      context.helpers.set(key, 1)
    }
  }
  return context
}

function traverseChildren(children, context) {
  if (children) {
    for (let i = 0; i < children.length; i++) {
      traverseNode(children[i], context)
    }
  }
}

function traverseNode(node: any, context) {
  // 执行插件
  const nodeTransforms = context.nodeTransforms
  const exitFns: any = []
  for (let i = 0; i < nodeTransforms.length; i++) {
    const transform = nodeTransforms[i]
    const onExit = transform(node, context)
    if (onExit) {
      exitFns.push(onExit)
    }
  }

  switch (node.type) {
    case NodeTypes.INTERPOLATION:
      context.helper(TO_DISPLAY_STRING)
      break
    case NodeTypes.ROOT:
    case NodeTypes.ElEMENT:
    case NodeTypes.COMPOUND_EXPRESSION:
      traverseChildren(node.children, context)
      break
    default:
      break
  }

  let i = exitFns.length
  while (i--) {
    exitFns[i]()
  }
}
