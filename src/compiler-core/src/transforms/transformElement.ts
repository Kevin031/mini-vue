import { NodeTypes, craeteVnodeCall } from '../ast'

export function transformElement(node, context) {
  if (node.type === NodeTypes.ElEMENT) {
    // tag
    const vnodeTag = `"${node.tag}"`
    // props
    let vnodeProps
    // children
    let vnodeChildren
    const children = node.children
    if (children.length > 0) {
      if (children.length === 1) {
        const child = children[0]
        vnodeChildren = child
      }
    }
    const vnodeElement = craeteVnodeCall(
      context,
      vnodeTag,
      vnodeProps,
      vnodeChildren
    )
    node.codegenNode = vnodeElement
  }
}
