import { ref, isRef, unRef, proxyRefs } from '../src/reactivity'

describe('ref', () => {
  it('happy path', () => {
    const foo = ref(0)
    expect(foo.value).toBe(0)
    foo.value++
    expect(foo.value).toBe(1)
  })

  it('ref children should be reactive', () => {
    const foo = ref({
      bar: {
        count: 1
      }
    })
    expect(foo.value.bar.count).toBe(1)
    foo.value.bar.count++
    expect(foo.value.bar.count).toBe(2)
  })
})

describe('isRef', () => {
  const foo = ref(0)
  expect(isRef(foo)).toBe(true)
  expect(1).not.toBe(true)
})

describe('unRef', () => {
  const a = ref(1)
  expect(unRef(a)).toBe(1)
  expect(unRef(1)).toBe(1)
})

describe('proxyRefs', () => {
  const user = ref({
    age: 20
  })
  it('get', () => {
    const proxyUser = proxyRefs(user)
    expect(proxyUser.age).toBe(20)
  })

  it('set', () => {
    const proxyUser = proxyRefs(user)
    proxyUser.age++
    expect(proxyUser.age).toBe(21)
  })
})
