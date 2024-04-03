import { event } from '@tauri-apps/api';
import { TauriEvent } from '@tauri-apps/api/event';
import { Sprite, Container, Text, TextStyle } from 'PIXI.js';
import Character from '../utils/character';
import loadAssets from '../utils/loadAssets';
import { Context } from '../context';
import State, { type StateType } from '../tools/state';
import Command from '../utils/command';
import { playMusic } from '../tools/audio';
import logger from '../tools/logger';
// import logger from '../tools/logger';

declare module '../context' {
  interface Context {
    els: Method['els'];
    ctn: Method['ctn'];
    view: Method['view'];
    play: Method['play'];
    background: Method['background'];
    character: Method['character'];
    pause: Method['pause'];
    text: Method['text'];
  }
}

interface CharacterOption {
  name?: string;
  figure?: string;
  show?: boolean;
}

export class Method {
  private readonly ctx: Context;

  private isShow = false;

  public readonly els = {
    bg: new Sprite(),
    msg: new Text(),
    name: new Text(),
    chars: new Map<string, Character>(),
  };

  public readonly ctn = {
    before: new Container(),
    middle: new Container(),
    after: new Container(),
  };

  private async initialize() {
    /* register */
    event.listen(TauriEvent.WINDOW_RESIZED, () => window.location.reload());
    /* elements */
    const { styles: s } = this.ctx.config;
    this.character('unknown', { name: '???' });
    const dialog = await loadAssets(s.dialog);
    this.ctx.app.stage.addChild(...Object.values(this.ctn));
    dialog.position.set(this.ctx.calcX(s.dialogX), this.ctx.calcY(s.dialogY));
    dialog.width = this.ctx.width();
    dialog.height = this.ctx.height() - dialog.y;
    this.els.name.position.set(this.ctx.calcX(s.dialogNameX), this.ctx.calcY(s.dialogNameY));
    this.els.name.style = new TextStyle({
      fontSize: this.ctx.calcY(s.dialogNameSize),
    });
    this.els.msg.position.set(this.ctx.calcX(s.dialogMsgX), this.ctx.calcY(s.dialogMsgY));
    this.els.msg.style = new TextStyle({
      breakWords: true,
      wordWrap: true,
      wordWrapWidth: this.ctx.calcX(s.dialogMsgWrap),
      fontSize: this.ctx.calcY(s.dialogMsgSize),
    });
    this.ctn.after.addChild(dialog, this.els.name, this.els.msg);
  }

  private register() {
    Command.set('background <images>').action((args) => this.ctx.background(args[0]));
    Command.set('character <identity>')
      .option('N', 'name:string')
      .option('F', 'figure:string')
      .action(async (args, opts) => {
        await this.ctx.character(args[0], opts);
      });
    Command.set('show <identity>')
      .option('H', 'hide:boolean')
      .action(async (args, opts) => {
        await this.ctx.character(args[0], { show: !opts.hide });
      });
    Command.set('say <message>')
      .option('S', 'speaker:string')
      .option('C', 'color:string')
      .action(async (args, opts) => {
        const { speaker } = opts;
        const isThink = !speaker || speaker === 'think';
        await this.ctx.text(isThink ? args[0] : `⌈${args[0]}⌋`, isThink ? this.ctx.els.chars.get(speaker)?.name : '');
      });
    Command.set('pause')
      .option('T', 'time')
      .action((_, opts) => this.ctx.pause(undefined, opts.time !== undefined ? Number(opts.time) : undefined));
    Command.set('music <filename>').action((args) => playMusic(args[0]));
  }

  public constructor(ctx: Context) {
    this.ctx = ctx;
    this.initialize();
    this.register();
  }

  public view(element: HTMLElement = document.body) {
    if (this.isShow) return;
    element.appendChild(this.ctx.app.view as unknown as Node);
    element.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'F5':
          event.preventDefault();
          break;
        case 'Enter':
          this.ctx.emit('view_click');
          break;
        case 'Control':
          break;
        default:
      }
    });
    element.addEventListener('click', () => this.ctx.emit('view_click'));
    this.background(this.ctx.config.styles.background);
    this.isShow = true;
  }

  public async play(option?: { script: string; index?: number }) {
    const { script, index } = option || {};
    const state = State.get() as StateType['dialog'];
    if (state.state !== 'dialog') state.state = 'dialog';
    if (script) {
      state.script = script;
      state.index = index ?? 0;
    } else if (!state.script) {
      state.script = this.ctx.config.entry;
      state.index = 0;
    }
    await this.ctx.parser.run().catch((e) => logger.error(e));
  }

  public async background(assets: string) {
    if (this.els.bg) this.ctn.before.removeChild(this.els.bg);
    this.els.chars.forEach((char) => char.hide());
    const el = await loadAssets(assets);
    el.width = this.ctx.width();
    el.height = this.ctx.height();
    this.ctn.before.addChild(el);
    this.els.bg = el;
  }

  public async character(identity: string, option: CharacterOption) {
    const { name, show, figure } = option;
    let char = this.els.chars.get(identity);
    if (!char) {
      char = new Character(this.ctx, identity, name);
      this.els.chars.set(identity, char);
    } else if (name) char.display(name);
    if (show) char[show ? 'view' : 'hide']();
    if (figure) await char.figure(figure);
    return char;
  }

  public pause(callback?: () => void, sleep?: number) {
    if (sleep !== undefined) {
      return new Promise<void>((resolve) => {
        const timer = setTimeout(() => {
          if (callback) callback();
          clearTimeout(timer);
          resolve(undefined);
        }, sleep * 1000);
      });
    }
    return new Promise<void>((resolve) => {
      this.ctx.once('view_click', () => {
        if (callback) callback();
        resolve(undefined);
      });
    });
  }

  public text(text: string, name: string = '') {
    let index = 0;
    let timerId: number;
    this.els.name.text = name;
    this.els.msg.text = text[index];
    const timer = () => {
      timerId = setTimeout(() => {
        index += 1;
        if (index >= text.length || text[index] === undefined) {
          clearTimeout(timerId);
          return;
        }
        this.els.msg.text += text[index];
        timer();
      }, 50);
    };
    timer();
    return this.pause(() => clearTimeout(timerId));
  }
}

export default Method;
