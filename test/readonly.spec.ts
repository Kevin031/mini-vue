import {
  isReadOnly,
  readonly,
  reactive,
  isProxy,
  shallowReadonly
} from '../src/reactivity'

describe('readonly', () => {
  it('happy path', () => {
    const original = { foo: 1, bar: { baz: 2 } }
    const wrapped = readonly(original)
    expect(wrapped).not.toBe(original)
    expect(wrapped.foo).toBe(1)
    expect(isReadOnly(wrapped.bar)).toBe(true)
    expect(isReadOnly(original)).toBe(false)
  })

  it('warn then call set', () => {
    console.warn = jest.fn()

    const user = readonly({
      age: 10
    })

    user.age = 10

    expect(console.warn).toBeCalled()
  })

  it('is proxy', () => {
    const original = { foo: 1, bar: { baz: 2 } }
    const wrapped = readonly(original)
    const active = reactive(original)
    expect(isProxy(original)).toBe(false)
    expect(isProxy(wrapped)).toBe(true)
    expect(isProxy(active)).toBe(true)
  })
})

describe('shallowReadonly', () => {
  it('shoult not make non-reactive properties reactive', () => {
    const props = shallowReadonly({ n: { foo: 1 } })
    expect(isReadOnly(props)).toBe(true)
    expect(isReadOnly(props.n)).toBe(false)
  })

  it('should call console.warn when set', () => {
    console.warn = jest.fn()
    const user = shallowReadonly({
      age: 10
    })
    user.age = 11
    expect(console.warn).toHaveBeenCalled()
  })
})
