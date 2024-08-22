import { Adapter, MessageScope, type Context, random } from '@kotori-bot/core'
import MisakuraApi from './api'
import MisakuraElements from './elements'

class MisakuraAdapter extends Adapter<MisakuraApi> {
  public readonly api: MisakuraApi = new MisakuraApi(this)

  public readonly elements: MisakuraElements = new MisakuraElements(this)

  public readonly platform = this.identity

  public constructor(ctx: Context) {
    super(ctx, { extends: 'misakura', master: '808', ...ctx.config.global }, 'misakura')
  }

  public exec(command: string) {
    if (command.startsWith('pre')) {
      this.session('on_message', {
        type: MessageScope.GROUP,
        groupId: '808',
        messageId: random.int().toString(),
        message: command,
        messageAlt: command,
        time: Date.now(),
        userId: '808',
        sender: { nickname: this.identity, role: 'member' }
      })
      return
    }
    this.session('on_message', {
      type: MessageScope.PRIVATE,
      messageId: random.int().toString(),
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
