import Logger, { ConsoleTransport, LoggerLevel } from '@kotori-bot/logger'
import isDev from './isDev'

export const logger = new Logger({
  level: isDev() ? LoggerLevel.DEBUG : LoggerLevel.SILENT,
  transports: new ConsoleTransport({ template: '<blue>%time%</blue> <bold>%level%</bold> %labels%: %msg%' })
})

export default console
