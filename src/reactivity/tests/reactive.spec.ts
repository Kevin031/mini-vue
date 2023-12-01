import { reactive, ref, effect, isReactive } from '../src'

describe('reactive', () => {
  const obj = { a: 1, b: 2, foo: { val: 3 } }
  const proxy = reactive(obj)
  it('happy path', () => {
    expect(proxy).not.toBe(obj)
    expect(proxy.a).toBe(1)
    expect(proxy.b).toBe(2)
    expect(proxy.foo.val).toBe(3)
    proxy.foo.val++
    expect(proxy.foo.val).toBe(4)
  })

  it('is reactive', () => {
    expect(isReactive(obj)).toBe(false)
    expect(isReactive(proxy)).toBe(true)
  })
})

describe('ref', () => {
  const val = ref(0)
  let effectVal
  effect(() => {
    effectVal = val.value
  })
  it('测试ref功能', () => {
    val.value++
    expect(val.value).toBe(1)
    expect(effectVal).toBe(1)
  })
})
