import Misakura from 'misakura'
import * as styles from './styles'

function main() {
  const ctx = new Misakura({ entry: '/scripts/claude3.mrs', styles })

  ctx.start()
  return ctx
}

export default main
