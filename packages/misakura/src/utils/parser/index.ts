import { Context } from '@kotori-bot/core'
import corePlugin from './plugin'
import MisakuraAdapter from './adapter'

export class Parser extends Context {
  private readonly bot = new MisakuraAdapter(this)

  public exec(command: string, preHandle = false) {
    this.bot.exec(preHandle ? `pre${command}` : command)
  }

  public constructor() {
    super({ global: { commandPrefix: '' } })
    this.load(corePlugin)
    this.start()
  }
}

export default Parser
