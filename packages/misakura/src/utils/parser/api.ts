import { Api, random, type Message } from '@kotori-bot/core'
import { logger } from '../../tools/logger'

class MisakuraApi extends Api {
  public getSupportedEvents(): ReturnType<Api['getSupportedEvents']> {
    return ['on_message']
  }

  public async sendPrivateMsg(message: Message) {
    logger.record(...(Array.isArray(message) ? message : [message.toString()]))
    return { time: Date.now(), messageId: random.uuid() }
  }

  public async sendGroupMsg() {
    return { time: Date.now(), messageId: random.uuid() }
  }
}

export default MisakuraApi
