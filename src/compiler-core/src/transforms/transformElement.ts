import { NodeTypes } from '../ast'
import { CREATE_ELEMENT_VNODE } from '../runtime-helpers'

export function transformElement(node, context) {
  if (node.type === NodeTypes.ElEMENT) {
    context.helper(CREATE_ELEMENT_VNODE)
  }
}
