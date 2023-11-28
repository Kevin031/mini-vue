import { h } from '../../lib/index.esm.js'

export const Foo = {
  setup(props) {
    console.log(props)
    props.count++
  },

  render() {
    return h('div', {}, [
      h('div', null, 'foo props:'),
      h('div', null, this.msg),
      h('div', null, `count: ${this.count}`)
    ])
  }
}
