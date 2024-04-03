import { LoggerData, Transport } from '@kotori-bot/logger';
import { none } from '@kotori-bot/tools';

export class MisakuraTransport extends Transport {
  public constructor() {
    super({});
  }

  handle(data: LoggerData) {
    /* eslint-disable-next-line no-console */
    console.log(data.msg);
    none(this);
  }
}

export default MisakuraTransport;
