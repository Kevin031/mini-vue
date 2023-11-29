import { advanceBy, baseParse } from '../src/parse'
import { NodeTypes } from '../src/ast'

describe('Parse', () => {
  test('advanceBy', () => {
    const context = {
      source: '{{message}}'
    }
    advanceBy(context, 2)
    expect(context.source).toBe('message}}')
  })

  describe('interpolation', () => {
    test('simple interpolation', () => {
      const ast = baseParse('{{message }}')
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: 'message'
        }
      })
    })
  })

  describe('element', () => {
    test('simple element div', () => {
      const ast = baseParse('<div></div>')

      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.ElEMENT,
        tag: 'div',
        children: []
      })
    })
  })

  describe('text', () => {
    test('simple element div', () => {
      const ast = baseParse('some text')

      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.TEXT,
        content: 'some text'
      })
    })
  })

  test('combine text', () => {
    const ast = baseParse('<div>hi,{{ message }}</div>')

    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ElEMENT,
      tag: 'div',
      children: [
        {
          type: NodeTypes.TEXT,
          content: 'hi,'
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: 'message'
          }
        }
      ]
    })
  })

  test('nest element', () => {
    const ast = baseParse('<div><p>hi,</p>{{ message }}</div>')

    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ElEMENT,
      tag: 'div',
      children: [
        {
          type: NodeTypes.ElEMENT,
          tag: 'p',
          children: [
            {
              type: NodeTypes.TEXT,
              content: 'hi,'
            }
          ]
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: 'message'
          }
        }
      ]
    })
  })

  test('should throw error when lack end tag', () => {
    expect(() => {
      baseParse('<div><span></div>')
    }).toThrow()
  })
})
