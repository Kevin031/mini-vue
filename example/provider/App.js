import { h, provide, inject, renderSlots } from '../../lib/index.esm.js'
import { Consumer } from './Consumer.js'

const Provider = {
  setup() {
    provide('foo', 'fooVal')
    provide('bar', 'fooVal')
  },

  render() {
    window.self = this

    return h('div', null, [h('p', null, 'Provider'), h(Consumer)])
  }
}

const ProviderTwo = {
  setup() {
    provide('fooTwo', 'fooTwoVal')
  },

  render() {
    window.self = this
    return h('div', null, [
      h('p', null, 'ProviderTwo'),
      renderSlots(this.$slots, 'default')
    ])
  }
}

const App = {
  setup() {},

  render() {
    window.self = this

    return h('div', null, [
      h(ProviderTwo, null, {
        default: h(Provider)
      })
    ])
  }
}

export default App
