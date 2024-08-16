import { Elements, type Message, type MessageMapping, Messages } from '@kotori-bot/core'

class MisakuraElements extends Elements {
  public getSupportsElements(): (keyof MessageMapping)[] {
    return ['text']
  }

  public decode(message: Message) {
    return message.toString()
  }

  encode(raw: string) {
    return Messages.text(raw)
  }
}

export default MisakuraElements
