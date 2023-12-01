import { NodeTypes } from './ast'
import {
  CREATE_ELEMENT_VNODE,
  TO_DISPLAY_STRING,
  helperMapName
} from './runtime-helpers'
import { isString } from '../../shared/utils'

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

/**
 * 创建生成器上下文
 * @returns
 */
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

/**
 * 生成模块前置导入
 * @param ast
 * @param context
 */
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

/**
 * 成成文本
 * @param node
 * @param context
 */
function genText(node, context) {
  const { push } = context
  push(`"${node.content}"`)
}

/**
 * 生成插值表达式
 * @param node
 * @param context
 */
function genInterpolation(node, context) {
  const { push } = context
  push(`_${context.helper(TO_DISPLAY_STRING)}(`)
  genNode(node.content, context)
  push(')')
}

/**
 * 生成插值代码
 * @param node
 * @param context
 */
function genExpression(node, context) {
  const { push } = context
  push(`${node.content}`)
}

/**
 * 生成元素代码
 * @param node
 * @param context
 */
function genElement(node, context) {
  const { push, helper } = context
  const { tag, children, props } = node
  push(`_${helper(CREATE_ELEMENT_VNODE)}(`)
  genNodeList(genNullable([tag, props, children]), context)
  push(')')
}

function genNodeList(nodes, context) {
  const { push } = context
  for (let i = 0; i < nodes.length; i++) {
    let node = nodes[i]
    if (isString(node)) {
      push(node)
    } else {
      genNode(node, context)
    }
    if (i < nodes.length - 1) {
      push(', ')
    }
  }
}

function genNullable(args: any) {
  return args.map(arg => arg || 'null')
}

function genCompoundExpression(node, context) {
  const { push } = context
  const { children } = node
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    if (isString(child)) {
      push(child)
    } else {
      genNode(child, context)
    }
  }
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
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node, context)
    default:
      break
  }
}
