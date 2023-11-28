import { h } from '../../lib/index.esm.js'

export const Foo = {
  setup(props, { emit }) {
    const emitAdd = () => {
      emit('add')
      emit('add-foo')
    }
    return {
      emitAdd
    }
  },

  render() {
    return h('div', {}, [
      h('div', null, 'foo props:'),
      h('div', null, this.msg),
      h('div', null, `count: ${this.count}`),
      h(
        'button',
        {
          onClick: () => {
            this.emitAdd()
          }
        },
        'click me'
      )
    ])
  }
}
