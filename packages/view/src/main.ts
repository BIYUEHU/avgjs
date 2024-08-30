import Misakura from 'misakura'
import * as styles from './styles'

function main(entry?: string) {
  const ctx = new Misakura({ entry, styles })

  ctx.start()
  return ctx
}

export default main
