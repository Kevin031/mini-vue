import { NodeTypes } from './ast'
import {
  CREATE_ELEMENT_VNODE,
  TO_DISPLAY_STRING,
  helperMapName
} from './runtime-helpers'

export function generate(ast) {
  const context = createCodegenContext()
  const { push } = context

  genFunctionPreamble(ast, context)
  const functionName = 'render'
  const args = ['_ctx', '_cache', '$props', '$setup', '$data', '$options']
  const signature = args.join(', ')
  push(`function ${functionName}(${signature}){`)
  push('return ')
  genNode(ast.codegenNode, context)
  push('}')

  return {
    code: context.code
  }
}

function createCodegenContext() {
  const context = {
    code: '',
    push(source) {
      context.code += source
    },
    helper(key) {
      return `${helperMapName[key]}`
    }
  }
  return context
}

function genFunctionPreamble(ast, context) {
  const { push } = context
  const VueBinging = 'Vue'
  const aliasHelper = s => `${context.helper(s)}: _${context.helper(s)}`
  if (ast.helpers.length > 0) {
    push(
      `const { ${ast.helpers.map(aliasHelper).join(', ')} } = ${VueBinging}\n`
    )
  }
  push('return ')
}

function genText(node, context) {
  const { push } = context
  push(`"${node.content}"`)
}

function genInterpolation(node, context) {
  const { push } = context
  push(`_${context.helper(TO_DISPLAY_STRING)}(`)
  genNode(node.content, context)
  push(')')
}

function genExpression(node, context) {
  const { push } = context
  push(`${node.content}`)
}

function genElement(node, context) {
  const { push, helper } = context
  push(`${helper(CREATE_ELEMENT_VNODE)}("${node.tag}")`)
}

function genNode(node, context) {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context)
      break
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context)
      break
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context)
      break
    case NodeTypes.ElEMENT:
      genElement(node, context)
      break
    default:
      break
  }
}
