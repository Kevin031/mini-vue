const queue: any[] = []
let isFlushPending = false

export function nextTick(callback) {
  return callback ? Promise.resolve().then(callback) : Promise.resolve()
}

function queueFlush() {
  if (isFlushPending) return
  nextTick(flushJobs)
}

function flushJobs() {
  isFlushPending = false
  let job
  while ((job = queue.shift())) {
    job && job()
  }
}

export function queueJobs(job) {
  if (!queue.includes(job)) {
    queue.push(job)
  }
  queueFlush()
}
