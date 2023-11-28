import { toHandlerKey, camelize } from '../shared/utils'

export function emit(instance, event, ...rest) {
  const { props } = instance

  const handlerName = toHandlerKey(camelize(event))
  const handler = props[handlerName]
  handler && handler(...rest)
}
