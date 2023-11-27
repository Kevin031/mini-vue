import { TrackOptions, TriggerOptions } from './operations'

let shouldTrack = true
let activeEffect: any = null
let effectStack: any[] = []
let ITERATE_KEY = Symbol('iterate')
let targetMap = new WeakMap()

// targetMap
// propMap
// typeMap
// dep

export function effect(fn, options: any = {}) {
  let { lazy = false, scheduler } = options
  const effectFn = () => {
    try {
      activeEffect = effectFn
      effectStack.push(effectFn)
      return fn()
    } finally {
      effectStack.pop()
      activeEffect = effectStack[effectStack.length - 1]
    }
  }
  effectFn.deps = []
  effectFn.scheduler = scheduler
  effectFn.active = true
  if (!lazy) {
    let res = effectFn()
    if (res !== undefined) {
      return res
    }
  }
  return effectFn
}

export function stop(effectFn) {
  cleanup(effectFn)
}

/**
 * 暂停依赖收集
 */
export function pauseTracking() {
  shouldTrack = false
}

/**
 * 恢复依赖收集
 */
export function resumeTracking() {
  shouldTrack = true
}

/**
 * 依赖收集
 * @param {object} target 对象
 * @param {string} type 更新方式
 * @param {string} key 属性
 * @returns
 */
export function track(target, type, key) {
  if (!shouldTrack || !activeEffect) return

  // 建立关系
  // targetMap > propMap > typeMap > deps
  let propMap = targetMap.get(target)
  if (!propMap) {
    propMap = new Map()
    targetMap.set(target, propMap)
  }

  if (type === TrackOptions.ITERATE) {
    key = ITERATE_KEY
  }

  let typeMap = propMap.get(key)
  if (!typeMap) {
    typeMap = new Map()
    propMap.set(key, typeMap)
  }

  let depSet = typeMap.get(type)
  if (!depSet) {
    depSet = new Set()
    typeMap.set(type, depSet)
  }

  depSet.add(activeEffect)

  // 给函数增加依赖集合
  activeEffect.deps.push(depSet)

  if (type === TrackOptions.ITERATE) {
    // console.log(`%c[${type}]`, "color: red");
    return
  }
  // console.log(`%c[${type}]`, "color: red", key);
}

/**
 * 清空依赖
 */
export function cleanup(effectFn) {
  const { deps } = effectFn
  if (deps && deps.length) {
    for (let dep of deps) {
      dep.delete(effectFn)
    }
    deps.length = 0
  }
}

/**
 *
 * @param {*} target 对象
 * @param {*} type 更新方式
 * @param {*} key 属性
 */
export function trigger(target, type, key, value) {
  // console.log(`%c[${type}]:${key}`, "color: blue", value);
  const effectFns = getEffectFns(target, type, key) as Set<any>
  if (effectFns) {
    for (let effectFn of effectFns) {
      // cleanup(effectFn);
      if (!effectFn.active) {
        continue
      }
      if (effectFn === activeEffect) {
        continue
      }
      if (effectFn.scheduler) {
        effectFn.scheduler()
      } else {
        effectFn()
      }
    }
  }
}

/**
 * 获取属性依赖的方法集合
 * @param {*} target 对象
 * @param {*} type 更新方式
 * @param {*} key 属性
 * @returns
 */
function getEffectFns(target, type, key) {
  let propMap = targetMap.get(target)
  if (!propMap) return
  const keys = [key]
  if (type === TriggerOptions.ADD || type === TriggerOptions.DELETE) {
    keys.push(ITERATE_KEY)
  }
  const effectFns = new Set()
  // 建立读写类型的关系
  const triggerTypeMap = {
    [TriggerOptions.SET]: [TrackOptions.GET],
    [TriggerOptions.ADD]: [
      TrackOptions.GET,
      TrackOptions.ITERATE,
      TrackOptions.HAS
    ],
    [TriggerOptions.DELETE]: [
      TrackOptions.GET,
      TrackOptions.ITERATE,
      TrackOptions.HAS
    ]
  }
  for (const key of keys) {
    let typeMap = propMap.get(key)
    if (!typeMap) continue
    const trackTypes = triggerTypeMap[type]
    for (const trackType of trackTypes) {
      const dep = typeMap.get(trackType)
      if (!dep) {
        continue
      }
      for (const effectFn of dep) {
        effectFns.add(effectFn)
      }
    }
  }
  return effectFns
}
