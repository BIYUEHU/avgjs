;(globalThis as unknown as { process: { pid: number } }).process = {
  pid: new Date().getTime()
}

import Context from './app'
export * from './class'

export default Context
