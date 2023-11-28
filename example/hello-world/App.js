import { h } from '../../lib/index.esm.js'
import { Foo } from './Foo.js'

const App = {
  setup() {
    return {
      msg: 'mini-vue hhhh'
    }
  },

  render() {
    window.self = this
    return h(
      'div',
      {
        class: ['root']
      },
      [
        h(
          'button',
          {
            onClick: () => {
              console.log('点击事件')
            },
            onMouseEnter: () => {
              console.log('mouse enter')
            }
          },
          'click me'
        ),
        h(
          'div',
          {
            class: ['child']
          },
          [
            h(
              'p',
              {
                class: 'blue'
              },
              'hi'
            ),
            h(
              'p',
              {
                class: 'red'
              },
              this.msg
            )
          ]
        ),
        h(
          Foo,
          {
            msg: this.msg,
            count: 1
          },
          null
        )
      ]
    )
  }
}

export default App
