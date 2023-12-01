import { effect, track, trigger } from './effect'
import { TrackOptions, TriggerOptions } from './operations'

function normalizeParameter(getterOrOptions) {
  let getter, setter
  if (typeof getterOrOptions === 'function') {
    getter = getterOrOptions
    setter = () => {
      console.warn(`Computed property was assigned but it has no setter.`)
    }
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }
  return { getter, setter }
}

export function computed(getterOrOptions) {
  const { getter, setter } = normalizeParameter(getterOrOptions)
  let value,
    dirty = true
  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      dirty = true
      trigger(result, TriggerOptions.SET, 'value', result.value)
    }
  })
  let result = {
    get value() {
      if (dirty) {
        value = effectFn()
        track(result, TrackOptions.GET, 'value')
        dirty = false
      }
      return value
    },
    set value(newValue) {
      setter(newValue)
    }
  }
  return result
}
