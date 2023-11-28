import { h, renderSlots } from '../../lib/index.esm.js'

export const Foo = {
  setup(props, { emit }) {
    const emitAdd = () => {
      emit('add')
      emit('add-foo')
    }
    return {
      emitAdd,
      fooAge: 18
    }
  },

  render() {
    window.foo = this
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
      ),
      renderSlots(this.$slots, 'default')
      // h('div', null, [
      //   // 具名插槽
      //   renderSlots(this.$slots, 'header', {
      //     age: this.fooAge
      //   }),
      //   h('span', null, 'foo'),
      //   renderSlots(this.$slots, 'footer')
      //   // renderSlots(this.$slots)
      // ])
    ])
  }
}
