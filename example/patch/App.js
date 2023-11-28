import { h, ref } from '../../lib/index.esm.js'
import { Foo } from './Foo.js'

const App = {
  setup() {
    const msg = ref('mini-vue hhhh')
    const count = ref(1)
    const setCount = val => {
      count.value = val
    }
    const rootProps = ref({
      foo: 'foo',
      bar: 'bar'
    })
    const list = ref([
      { title: 'list item 1' },
      { title: 'list item 2' },
      { title: 'list item 3' },
      { title: 'list item 4' },
      { title: 'list item 5' },
      { title: 'list item 6' },
      { title: 'list item 7' }
    ])
    const deleteListItem = idx => {
      list.value = list.value.filter((_, index) => index !== idx)
    }
    const changeProps = props => {
      rootProps.value = props
    }
    return {
      msg,
      count,
      list,
      setCount,
      rootProps,
      changeProps,
      deleteListItem
    }
  },

  render() {
    window.self = this

    return h(
      'div',
      {
        class: ['root'],
        ...this.rootProps
      },
      [
        h('ul', null, [
          ...this.list.map(item =>
            h('li', { class: ['list-item'] }, item.title)
          )
        ]),
        h(
          'button',
          {
            onClick: () => this.deleteListItem(2)
          },
          '删除第三个元素'
        )
      ]
      // [
      //   h('div', null, `count: ${this.count}`),
      //   h('div', null, `msg: ${this.msg}`),
      //   h(
      //     'button',
      //     {
      //       onClick: () => this.setCount(this.count + 1)
      //     },
      //     'add 1'
      //   ),
      //   h(
      //     'button',
      //     {
      //       onClick: () =>
      //         this.changeProps({
      //           foo: 'foo1',
      //           bar: 'bar1'
      //         })
      //     },
      //     'changeProps'
      //   ),
      //   h(
      //     'button',
      //     {
      //       onClick: () =>
      //         this.changeProps({
      //           bar: 'bar'
      //         })
      //     },
      //     '删除foo1'
      //   )
      // ]
    )
  }
}

export default App
