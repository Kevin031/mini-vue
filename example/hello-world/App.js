import { h } from '../../lib/index.esm.js'

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
        )
      ]
    )
  }
}

export default App
