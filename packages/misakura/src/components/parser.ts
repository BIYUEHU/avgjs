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
      const { root } = cmd[1].meta;
      switch (root) {
        case 'background':
          if (index > this.index) break;
          operation.bg = cmd;
          Assets.load(args[0]);
          Object.keys(operation.chars).forEach((key) => {
            operation.chars[key][0].show = false;
          });
          break;
        /* TODO: change to audio and video */
        case 'music':
          if (index > this.index) break;
          operation.music = cmd;
          Assets.load(args[0]);
          break;
        case 'say':
          if (index <= this.index) operation.text = cmd;
          if (index <= this.index || State.debug) charsExists(cmd[0].speaker);
          break;
        case 'character':
          if (!(args[0] in operation.chars)) {
            operation.chars[args[0]] = cmd;
            return;
          }
          if (cmd[0].name) operation.chars[args[0]][0].name = cmd[0].name;
          if (cmd[0].fiure) operation.chars[args[0]][0].fiure = cmd[0].fiure;
          break;
        case 'show':
          if (index <= this.index) operation.chars[args[0]][0].show = !cmd[0].hide;
          if (index <= this.index || State.debug) charsExists(args[0]);
          break;
        default:
      }
    });
    if (operation.bg) Command.run(...operation.bg);
    if (operation.music) Command.run(...operation.music);
    /* eslint-disable-next-line no-restricted-syntax */
    for await (const cmd of Object.values(operation.chars)) {
      await Command.run(cmd[0], cmd[1]);
    }
  }

  private async nexthandle() {
    /* eslint-disable-next-line no-restricted-syntax */
    for await (const cmd of this.cmds.splice(this.index)) {
      await Command.run(...cmd);
      (State.get() as StateType['dialog']).index += 1;
      this.index = (State.get() as StateType['dialog']).index;
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
