import { h, inject } from '../../lib/index.esm.js'

export const Consumer = {
  name: 'Consumer',

  setup() {
    const foo = inject('foo')
    const bar = inject('bar')
    const fooTwo = inject('fooTwo')
    const defaultVal = inject('def', 'defaultVal')
    const defaultVal2 = inject('def', () => {
      return 'defaultVal2'
    })

    return {
      foo,
      bar,
      fooTwo,
      defaultVal,
      defaultVal2
    }
  },

  render() {
    return h('div', null, [
      h('div', null, `foo: ${this.foo}`),
      h('div', null, `bar: ${this.bar}`),
      h('div', null, `fooTwo: ${this.fooTwo}`),
      h('div', null, `defaultVal: ${this.defaultVal}`),
      h('div', null, `defaultValFn: ${this.defaultVal2}`)
    ])
  }
}
