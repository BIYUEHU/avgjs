import { Assets } from 'PIXI.js';
import { State, type StateType } from '../tools/state';
import Command from '../utils/command';
import logger from '../tools/logger';
import loadScript from '../utils/loadScript';

type CommandParsed = ReturnType<typeof loadScript> extends Promise<infer U>
  ? U extends (infer E)[]
    ? E
    : never
  : never;

interface Operation {
  bg?: CommandParsed;
  text?: CommandParsed;
  music?: CommandParsed;
  chars: Record<string, CommandParsed>;
}

export class Parser {
  private index: number = 0;

  private cmds: CommandParsed[] = [];

  private async prehandle() {
    const operation: Operation = { chars: {} };
    const charsExists = (id: string) => {
      if (id === 'think' || id === 'unknown') return;
      if (id in operation.chars) return;
      logger.warn(`Cannot find character "${id}"`);
    };
    this.cmds.forEach((cmd, index) => {
      const { _: args } = cmd[0];
      switch (args[0]) {
        case 'background':
          if (index > this.index) break;
          operation.bg = cmd;
          Assets.load(args[1]);
          Object.keys(operation.chars).forEach((key) => {
            operation.chars[key][0].show = false;
          });
          break;
        /* TODO: change to audio and video */
        case 'music':
          if (index > this.index) break;
          operation.music = cmd;
          Assets.load(args[1]);
          break;
        case 'say':
          if (index <= this.index) operation.text = cmd;
          if (index <= this.index || State.debug) charsExists(cmd[0].speaker);
          break;
        case 'character':
          operation.chars[args[1]] = { ...(operation.chars[args[1]] ?? []), ...cmd };
          break;
        /* TODO: better debug to find question */
        case 'show':
          if (index <= this.index || State.debug) charsExists(args[1]);
          if (index <= this.index) operation.chars[args[1]][0].show = !cmd[0].hide;
          break;
        default:
      }
    });
    if (operation.bg) Command.run(...operation.bg);
    if (operation.music) Command.run(...operation.music);
    /* eslint-disable-next-line no-restricted-syntax */
    for await (const cmd of Object.values(operation.chars)) {
      await Command.run(...cmd);
    }
    if (operation.text) await Command.run(...operation.text);
  }

  private async nexthandle() {
    /* eslint-disable-next-line no-restricted-syntax */
    for await (const cmd of this.cmds.splice(this.index)) {
      await Command.run(...cmd);
      (State.get() as StateType['dialog']).index += 1;
    }
  }

  public async run() {
    const { script, index } = State.get() as StateType['dialog'];
    this.cmds = await loadScript(script);
    this.index = index;
    if (this.cmds.length <= this.index) throw new Error('script lines error');
    await this.prehandle();
    await this.nexthandle();
  }
}

export default Parser;
