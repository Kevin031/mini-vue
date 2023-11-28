import { track, trigger } from './effect'
import { TrackOptions, TriggerOptions } from './operations'
import { ReactiveFlags, reactive } from './reactive'
import { hasChanged, isObject } from '../shared/utils'

function convert(value) {
  return isObject(value) ? reactive(value) : value
}

class RefImpl {
  _rawValue: any
  _value: any
  constructor(value) {
    this._rawValue = value
    this._value = convert(value)
    this[ReactiveFlags.IS_REF] = true
  }

  get value() {
    track(this, TrackOptions.GET, 'value')
    return this._value
  }

  set value(newValue) {
    if (hasChanged(newValue, this._rawValue)) {
      this._rawValue = newValue
      this._value = convert(newValue)
      trigger(this, TriggerOptions.SET, 'value', this._value)
    }
  }
}

export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      return unRef(Reflect.get(target, key))
    },
    set(target, key, value) {
      if (isRef(target[key])) {
        target[key].value = value
        return true
      } else {
        return Reflect.set(target.value, key, value)
      }
    }
  })
}

export function isRef(target) {
  return target && target[ReactiveFlags.IS_REF]
}

export function unRef(target) {
  return isRef(target) ? target.value : target
}

export function ref(value) {
  return new RefImpl(value)
}
