export function timeout(fn: () => void, delay: number) {
  const timer = setTimeout(() => {
    fn()
    clearTimeout(timer)
  }, delay)
  return () => clearTimeout(timer)
}

export function interval(fn: () => void, delay: number) {
  const timer = setInterval(() => {
    fn()
  }, delay)
  return () => clearInterval(timer)
}

export function nextTick(fn: () => void) {
  timeout(fn, 0)
}
