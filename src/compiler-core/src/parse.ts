import { NodeTypes } from './ast'

export function baseParse(content: string) {
  const context = createParserContext(content)
  return context
}

function createParserContext(content) {
  const context = parseChildren({ source: content })
  return createRoot(context)
}

function parseChildren(context) {
  const nodes: any[] = []
  let node
  if (context.source.startsWith('{{')) {
    node = parseInterpolation(context)
  }
  nodes.push(node)
  return nodes
}

function advanceBy(context, length) {
  context.source = context.source.slice(length)
}

function parseInterpolation(context) {
  const openDelimiter = '{{'
  const closeDelimiter = '}}'

  // 查找索引，推进指针
  const closeIndex = context.source.indexOf(
    closeDelimiter,
    openDelimiter.length
  )

  advanceBy(context, openDelimiter.length)

  const rawContentLength = closeIndex - closeDelimiter.length

  // 匹配花括号内的内容
  const rawContent = context.source.slice(0, rawContentLength)
  const content = rawContent.trim()

  // 删除匹配到的部分
  context.source = context.source.slice(rawContentLength + 2)

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: content
    }
  }
}

function createRoot(children) {
  return {
    children
  }
}
