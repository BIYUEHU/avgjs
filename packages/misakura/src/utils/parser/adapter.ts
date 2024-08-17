import { Adapter, MessageScope, type Context } from '@kotori-bot/core'
import MisakuraApi from './api'
import MisakuraElements from './elements'
import { getDialogLine } from '../../store'

class MisakuraAdapter extends Adapter<MisakuraApi> {
  public readonly api: MisakuraApi = new MisakuraApi(this)

  public readonly elements: MisakuraElements = new MisakuraElements(this)

  public readonly platform = this.identity

  public constructor(ctx: Context) {
    super(ctx, { extends: 'misakura', master: '808', ...ctx.config.global }, 'misakura')
  }

  public exec(command: string) {
    this.session('on_message', {
      type: MessageScope.PRIVATE,
      messageId: getDialogLine().toString(),
      message: command,
      messageAlt: command,
      time: Date.now(),
      userId: '808',
      sender: { nickname: this.identity }
    })
  }

  public handle() {}

  public start() {}

  public send() {}

  public stop() {}
}

export default MisakuraAdapter
