import { NodeTypes } from './ast'

const enum TagType {
  Start,
  End
}

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
  const s = context.source
  if (s.startsWith('{{')) {
    node = parseInterpolation(context)
  } else if (s[0] === '<') {
    if (/[a-z]/.test(s[1])) {
      node = parseElement(context)
    }
  } else {
    node = parseText(context)
  }
  nodes.push(node)
  return nodes
}

/**
 * 删除指定长度的代码
 * @param context
 * @param length
 */
function advanceBy(context, length) {
  context.source = context.source.slice(length)
}

function parseTag(context, type: TagType) {
  const match: any = /^<(\/?[a-z]*)/i.exec(context.source)
  const tag = match[1]
  advanceBy(context, match[0].length)
  advanceBy(context, 1)
  if (type === TagType.End) return

  return {
    type: NodeTypes.ElEMENT,
    tag: tag
  }
}

function parseTextData(context, length) {
  const content = context.source.slice(0, length)
  // 推进
  advanceBy(context, content.length)
  return content
}

function parseText(context) {
  // 获取content
  const content = parseTextData(context, context.source.length)
  return {
    type: NodeTypes.TEXT,
    content: content
  }
}

function parseElement(context) {
  // 解析tag
  const element = parseTag(context, TagType.Start)
  // 删除处理完成的代码
  parseTag(context, TagType.End)

  return element
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
  const rawContent = parseTextData(context, rawContentLength)
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
