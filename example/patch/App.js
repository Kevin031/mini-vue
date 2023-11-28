import { h, ref } from '../../lib/index.esm.js'
import { Foo } from './Foo.js'

const App = {
  setup() {
    const msg = ref('mini-vue hhhh')
    const count = ref(1)
    const setCount = val => {
      count.value = val
    }
    return {
      msg,
      count,
      setCount
    }
  },

  render() {
    window.self = this

    // const fooSlot = h('div', null, 'i am slot children')

    return h(
      'div',
      {
        class: ['root']
      },
      [
        h('div', null, `count: ${this.count}`),
        h('div', null, `msg: ${this.msg}`),
        h(
          'button',
          {
            onClick: () => this.setCount(this.count + 1)
          },
          'add 1'
        )
      ]
    )
  }
}

export default App
