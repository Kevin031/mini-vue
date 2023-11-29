import { h, ref, nextTick, getCurrentInstance } from '../../lib/index.esm.js'
import { Foo } from './Foo.js'

const App = {
  setup() {
    const msg = ref('mini-vue hhhh')
    const instance = getCurrentInstance()
    const setMsg = val => {
      msg.value = val
    }
    const count = ref(1)
    const setCount = val => {
      count.value = val
    }
    const setCountQueue = val => {
      for (let i = count.value; i <= val; i++) {
        setCount(i)
      }
      nextTick(() => {
        console.log('instance', instance)
      })
    }
    const rootProps = ref({
      foo: 'foo',
      bar: 'bar'
    })
    const list = ref([
      { title: 'list item A', key: 'A' },
      { title: 'list item B', key: 'B' },
      { title: 'list item C', key: 'C' },
      { title: 'list item D', key: 'D' },
      { title: 'list item E', key: 'E' }
    ])
    const deleteListItem = idx => {
      list.value = list.value.filter((_, index) => index !== idx)
    }
    const changeProps = props => {
      rootProps.value = props
    }
    const addListItem = () => {
      list.value = [
        { title: 'list item A', key: 'A' },
        { title: 'list item B', key: 'B' },
        { title: 'list item C', key: 'C' },
        { title: 'list item F', key: 'F' },
        { title: 'list item G', key: 'G' },
        { title: 'list item D', key: 'D' },
        { title: 'list item E', key: 'E' }
      ]
    }
    return {
      msg,
      setMsg,
      count,
      list,
      setCount,
      rootProps,
      changeProps,
      deleteListItem,
      addListItem,
      setCountQueue
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
        h('div', null, `count:` + this.count),
        h('span', null, 'parent msg' + this.msg),
        h(Foo, {
          msg: this.msg
        }),
        h('ul', null, [
          ...this.list.map(item =>
            h('li', { class: ['list-item'], key: item.key }, item.title)
          )
        ]),
        h(
          'button',
          {
            onClick: () => this.deleteListItem(2)
          },
          '删除第三个元素'
        ),
        h(
          'button',
          {
            onClick: () => this.addListItem()
          },
          '新增元素'
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
