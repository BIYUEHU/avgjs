import minimist from 'minimist';
import { parseArgs } from '@kotori-bot/tools';
import Visual from '../visual';

export class Parser {
  private static async load(file: string) {
    let handle = file;
    if (file[file.length - 1] === '/') handle = `${file}/main.mrs`;
    else if (file.split('.')[file.split('.').length - 1] !== 'mrs') handle = `${file}.mrs`;
    const text = await (await fetch(handle)).text();
    const lines = text.includes('\r\n') ? text.split('\r\n') : text.split('\n');
    const commands = lines.map((line) => {
      const result = parseArgs(line.trim());
      if (!Array.isArray(result)) {
        /* TODO: error handle */
        throw new Error(JSON.stringify(result));
      }
      return minimist(result, {
        /* TODO: options handle */
        string: ['color', 'speaker'],
      });
    });
    return commands;
  }

  private readonly ctx: Visual;

  public constructor(ctx: Visual) {
    this.ctx = ctx;
  }
}

export default Parser;
