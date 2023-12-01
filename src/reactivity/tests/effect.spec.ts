import { reactive, effect, ref, stop } from '../src'

describe('effect', () => {
  it('happy path', () => {
    const user = reactive({
      age: 10
    })
    let nextAge
    effect(() => {
      nextAge = user.age + 1
    })
    expect(nextAge).toBe(11)

    //update
    user.age++
    expect(nextAge).toBe(12)
    expect(nextAge).toBe(12)
  })

  it('验证effect runner', () => {
    let foo = 10
    const runner = effect(() => {
      foo++
      return 'foo'
    })
    expect(foo).toBe(11)
    const r = runner
    expect(r).toBe('foo')
  })

  it('验证effect lazy', () => {
    let foo = 10
    let baz = ref(0)
    const runner = effect(
      () => {
        baz.value++
        foo++
      },
      {
        lazy: true
      }
    )
    expect(foo).toBe(10)
    runner()
    expect(foo).toBe(11)
    baz.value++
    expect(foo).toBe(12)
  })

  it('验证effect scheduler', () => {
    let foo
    let baz = ref(0)
    const scheduler = jest.fn(() => {
      foo = baz.value
    })
    effect(
      () => {
        foo = baz.value
      },
      {
        scheduler
      }
    )
    expect(scheduler).not.toHaveBeenCalled()
    expect(foo).toBe(0)
    baz.value++
    expect(scheduler).toHaveBeenCalledTimes(1)
    expect(foo).toBe(1)
  })

  it('验证stop', () => {
    let dummy
    let obj = reactive({ prop: 1 })
    const runner = effect(() => {
      dummy = obj.prop
    })
    obj.prop = 2
    expect(dummy).toBe(2)
    stop(runner)
    obj.prop = 3
    expect(dummy).toBe(2)
    runner()
    expect(dummy).toBe(3)
  })
})
