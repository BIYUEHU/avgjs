import Logger, { ConsoleTransport, LoggerLevel } from '@kotori-bot/logger'
// import { State } from '../tools/state'

export const logger = new Logger({
  level: /* State.debug ? LoggerLevel.DEBUG : LoggerLevel.SILENT */ LoggerLevel.DEBUG,
  transports: new ConsoleTransport({ template: '<blue>%time%</blue> <bold>%level%</bold> %labels%: %msg%' })
})

export default console
