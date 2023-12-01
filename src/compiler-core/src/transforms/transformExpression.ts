import { NodeTypes } from '../ast'

export function transformExpression(node) {
  if (node.type === NodeTypes.INTERPOLATION) {
    return () => {
      processExpression(node.content)
    }
  }
}

function processExpression(node: any) {
  node.content = '_ctx.' + node.content
  return node
}
