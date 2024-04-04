import Logger, { LoggerLevel } from '@kotori-bot/logger';
import { State } from '../tools/state';
import MisakuraTransport from './transport';

export const logger = new Logger({
  level: State.debug ? LoggerLevel.DEBUG : LoggerLevel.SILENT,
  transports: new MisakuraTransport(),
});

export default console;
