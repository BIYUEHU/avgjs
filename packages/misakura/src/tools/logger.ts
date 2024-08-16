import Logger, { ConsoleTransport, LoggerLevel } from '@kotori-bot/logger'
import { State } from '../tools/state'

export const logger = new Logger({
  level: State.debug ? LoggerLevel.DEBUG : LoggerLevel.SILENT,
  transports: new ConsoleTransport()
})

export default console
