import { Assets } from 'PIXI.js';
import { State } from '../tools/state';
import Command from './command';
import logger from '../tools/logger';
import loadScript from './loadScript';

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
          if (index > State.index) break;
          operation.bg = cmd;
          Assets.load(args[0]);
          Object.keys(operation.chars).forEach((key) => {
            operation.chars[key][0].show = false;
          });
          break;
        /* TODO: change to audio and video */
        case 'music':
          if (index > State.index) break;
          operation.music = cmd;
          Assets.load(args[0]);
          break;
        case 'say':
          if (index <= State.index) operation.text = cmd;
          if (index <= State.index || State.debug) charsExists(cmd[0].speaker);
          break;
        case 'character':
          if (!(args[0] in operation.chars)) {
            operation.chars[args[0]] = cmd;
            break;
          }
          if (index > State.index) {
            break;
          }
          if (cmd[0].name) operation.chars[args[0]][0].name = cmd[0].name;
          if (cmd[0].fiure) operation.chars[args[0]][0].fiure = cmd[0].fiure;
          break;
        case 'show':
          if (index <= State.index && args[0] in operation.chars) {
            operation.chars[args[0]][0].show = !cmd[0].hide;
            if (cmd[0].figure) operation.chars[args[0]][0].figure = cmd[0].figure;
          }
          if (index <= State.index || State.debug) charsExists(args[0]);
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
    for await (const cmd of this.cmds.splice(State.index)) {
      await Command.run(...cmd);
      State.index! += 1;
    }
  }

  public async run() {
    this.cmds = await loadScript(State.script);
    if (this.cmds.length <= State.index) throw new Error('script lines error');
    await this.prehandle();
    await this.nexthandle();
  }
}

export default Parser;
