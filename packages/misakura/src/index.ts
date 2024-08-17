// import { render } from 'solid-js/web'
import Context from './app'
;(globalThis as unknown as { process: { pid: number } }).process = {
  pid: new Date().getTime()
}

// render(() => <>hello</>, document.body)

export * from './components'

export default Context
