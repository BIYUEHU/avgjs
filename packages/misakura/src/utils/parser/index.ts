import { Context } from '@kotori-bot/core'
import PluginCore from '@kotori-bot/kotori-plugin-core'
import MisakuraAdapter from './adapter'

export class Parser extends Context {
  private readonly bot = new MisakuraAdapter(this)

  public exec(command: string) {
    return this.bot.exec(command)
  }

  public constructor() {
    super({ global: { commandPrefix: '' } })
    this.load(PluginCore)
    this.start()
  }
}

export default Parser
