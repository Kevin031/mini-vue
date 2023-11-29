import { h, renderSlots, getCurrentInstance } from '../../lib/index.esm.js'

export const Foo = {
  setup(props) {
    return {}
  },

  render() {
    window.foo = this
    return h('div', null, [
      h('span', null, 'foo:'),
      h('span', null, this.$props.msg)
    ])
  }
}
