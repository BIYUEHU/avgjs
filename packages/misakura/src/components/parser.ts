import { Assets } from 'PIXI.js';
import { parseArgs } from '@kotori-bot/tools';
import Visual from '../visual';
import State, { StateType } from './state';
import Command from './command';
import { playMusic } from '../tools/audio';

type CommandParsed = ReturnType<(typeof Parser)['load']> extends Promise<infer U>
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
  private static async load(script: string) {
    let handle = script;
    if (script.charAt(script.length - 1) === '/') handle = `${script}/main.mrs`;
    else if (script.split('.')[script.split('.').length - 1] !== 'mrs') handle = `${script}.mrs`;
    const text = await (await fetch(handle)).text();
    const lines = text
      .split(text.includes('\r\n') ? '\r\n' : '\n')
      .filter((line) => line.trim() && !line.trim().startsWith('#'));
    let lastSpeaker: string;
    return lines.map((line) => {
      let result = parseArgs(line.trim());
      if (!Array.isArray(result)) {
        throw new Error(JSON.stringify(result));
      }
      if (result[0].charAt(result[0].length - 1) === ':') {
        let speaker = result[0].substring(0, result[0].length - 1);
        if (speaker) lastSpeaker = speaker;
        else speaker = lastSpeaker;
        delete result[0];
        result = ['say', result.join(' ').trim(), '--speaker', speaker === 'think' ? '' : speaker];
      }
      const parsed = Command.handle(result);
      if (parsed instanceof Error) throw Error;

      return parsed;
    });
  }

  private readonly ctx: Visual;

  private index: number = 0;

  private cmds: CommandParsed[] = [];

  private async prehandle() {
    const operation: Operation = { chars: {} };
    const charsExists = (id: string) => {
      if (id === 'think' || id === 'unknown') return;
      if (id in operation.chars) return;
      console.warn(`Cannot find character "${id}"`);
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
        case 'play':
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
          if (!State.debug) break;
          console.warn(`Unknown cmd "${args[0]}" at ${index + 1} line`);
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
    for await (const cmd of this.cmds.splice(this.index + 1)) {
      (State.get() as StateType['dialog']).index += 1;
      Command.run(...cmd);
    }
  }

  private register() {
    Command.set('background <images>').action((args) => this.ctx.background(args[0]));
    Command.set('character <identity>')
      .option('N', 'name:string')
      .option('F', 'figure:string')
      .action(async (args, opts) => {
        const { name, figure, show } = opts;
        await this.ctx.character(args[0], { name, figure, show });
      });
    Command.set('show <identity>')
      .option('H', 'hide:boolean')
      .action(async (args, opts) => {
        await this.ctx.character(args[0], { show: !opts.hide });
      });
    Command.set('say <message>')
      .option('S', 'speaker:string')
      .option('C', 'color:string')
      .action((args, opts) => {
        const { speaker } = opts;
        if (!speaker) return this.ctx.text(args[0]);
        return this.ctx.elements.chars.get(speaker)?.text(args[0]);
      });
    Command.set('pause')
      .option('T', 'time')
      .action((_, opts) => this.ctx.pause(undefined, opts.time !== undefined ? Number(opts.time) : undefined));
    Command.set('music <filename>').action((args) => playMusic(args[0]));
  }

  public constructor(ctx: Visual) {
    this.ctx = ctx;
    this.register();
  }

  public async run() {
    const { script, index } = State.get() as StateType['dialog'];
    this.cmds = await Parser.load(script);
    console.log(this.cmds);
    this.index = index;
    if (this.cmds.length <= this.index) throw new Error('script lines error');
    await this.prehandle();
    await this.nexthandle();
  }
}

export default Parser;
