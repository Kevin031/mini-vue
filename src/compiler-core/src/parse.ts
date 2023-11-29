import { NodeTypes } from './ast'

const enum TagType {
  Start,
  End
}

/**
 * 解析内容
 * @param content
 * @returns
 */
export function baseParse(content: string) {
  const context = createParserContext(content)
  return createRoot(parseChildren(context, []))
}

/**
 * 创建解析上下文
 * @param content
 * @returns
 */
function createParserContext(content) {
  const context = {
    source: content
  }
  return context
}

/**
 * 判断是否结束解析
 * @param context
 * @returns
 */
function isEnd(context, ancestors) {
  const s = context.source

  if (s.startsWith('</')) {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const tag = ancestors[i].tag
      if (startsWithEngTagOpen(s, tag)) {
        return true
      }
    }
  }

  return !s
}

/**
 * 解析children
 * @param context
 * @returns
 */
function parseChildren(context, ancestors) {
  const nodes: any[] = []
  while (!isEnd(context, ancestors)) {
    let node
    const s = context.source
    if (s.startsWith('{{')) {
      node = parseInterpolation(context)
    } else if (s[0] === '<') {
      if (/[a-z]/.test(s[1])) {
        node = parseElement(context, ancestors)
      }
    } else {
      node = parseText(context)
    }
    nodes.push(node)
  }
  return nodes
}

/**
 * 删除指定长度的代码
 * @param context
 * @param length
 */
export function advanceBy(context, length) {
  context.source = context.source.slice(length)
}

function parseTag(context, type: TagType) {
  const match: any = /^<(\/?[a-z]*)/i.exec(context.source)
  if (!match) return
  const tag = match[1]
  advanceBy(context, match[0].length)
  advanceBy(context, 1)
  if (type === TagType.End) return

  return {
    type: NodeTypes.ElEMENT,
    tag: tag
  }
}

/**
 * 解析和推进text内容
 * @param context
 * @param length
 * @returns
 */
function parseTextData(context, length) {
  const content = context.source.slice(0, length)
  // 推进
  advanceBy(context, content.length)
  return content
}

/**
 * 解析文本内容
 * @param context
 * @returns
 */
function parseText(context) {
  let endIndex = context.source.length
  let endTokens = ['{{', '</']
  for (let i = 0; i < endTokens.length; i++) {
    let index = context.source.indexOf(endTokens[i])
    if (index !== -1 && endIndex > index) {
      endIndex = index
    }
  }

  // 获取content
  const content = parseTextData(context, endIndex)
  return {
    type: NodeTypes.TEXT,
    content: content
  }
}

function startsWithEngTagOpen(source, tag) {
  return (
    source.startsWith('</') &&
    source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
  )
}

/**
 * 解析element元素
 * @param context
 * @param ancestors 祖先元素上下文
 * @returns
 */
function parseElement(context, ancestors) {
  // 解析tag
  const element: any = parseTag(context, TagType.Start)
  ancestors.push(element)
  element.children = parseChildren(context, ancestors)
  ancestors.pop()
  // 删除结束标签
  if (startsWithEngTagOpen(context.source, element.tag)) {
    parseTag(context, TagType.End)
    return element
  } else {
    throw new Error(`缺少结束标签${element.tag}`)
  }
}

/**
 * 解析插值节点
 * @param context
 * @returns
 */
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
  context.source = context.source.slice(2)

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: content
    }
  }
}

/**
 * 解析根节点
 * @param children
 * @returns
 */
function createRoot(children) {
  return {
    children
  }
}
