import Misakura from 'misakura'
import * as styles from './styles'

function main() {
  const ctx = new Misakura({ entry: 'complex', styles })

  ctx.start()
  return ctx
}

export default main
