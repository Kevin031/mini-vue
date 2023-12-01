import { NodeTypes } from '../ast'
import { isText } from '../utils'

export function transformText(node) {
  if (node.type === NodeTypes.ElEMENT) {
    const { children } = node
    for (let i = 0; i < children.length; i++) {
      let child = children[i]
      let currentContainer

      if (isText(child)) {
        for (let j = i + 1; j < children.length; j++) {
          const next = children[j]
          if (isText(next)) {
            currentContainer = {
              type: NodeTypes.COMPOUND_EXPRESSION,
              children: [child]
            }
            children[i] = currentContainer

            currentContainer.children.push(' + ')
            currentContainer.children.push(next)
            children.splice(j, 1)
            j--
          } else {
            currentContainer = undefined
            break
          }
        }
      }
    }
  }
}
