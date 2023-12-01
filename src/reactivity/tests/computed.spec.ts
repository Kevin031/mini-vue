import { computed, ref } from '../src'

describe('验证computed功能', () => {
  it('只定义getter', () => {
    const a = ref(2)
    const b = ref(3)
    const sum = computed(() => {
      return a.value + b.value
    })
    expect(sum.value).toBe(5)
    a.value++
    expect(sum.value).toBe(6)
  })

  it('定义getter和setter', () => {
    const a = ref(2)
    const sum = computed({
      get() {
        return a.value
      },
      set(val) {
        a.value = val
      }
    })
    expect(sum.value).toBe(2)
    sum.value = 3
    expect(sum.value).toBe(3)
  })
})
