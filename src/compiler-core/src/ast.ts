import { CREATE_ELEMENT_VNODE } from './runtime-helpers'

export const enum NodeTypes {
  INTERPOLATION,
  SIMPLE_EXPRESSION,
  ElEMENT,
  TEXT,
  ROOT,
  COMPOUND_EXPRESSION
}

export function craeteVnodeCall(context, tag, props, children) {
  context.helper(CREATE_ELEMENT_VNODE)
  return {
    type: NodeTypes.ElEMENT,
    tag,
    props,
    children
  }
}
