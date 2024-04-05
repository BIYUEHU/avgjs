import { Sprite, Text, TextStyle } from 'PIXI.js';
import Character from '../utils/character';
import loadAssets from '../utils/loadAssets';
import Command from '../utils/command';
import Media from '../tools/media';
import logger from '../tools/logger';
import { Parser } from '../utils/parser';
import Page from '../utils/page';
import { State } from '../tools/state';

interface CharacterOption {
  name?: string;
  figure?: string;
  show?: boolean;
}

export class DialogPage extends Page {
  public readonly els = {
    bg: new Sprite(),
    msg: new Text(),
    name: new Text(),
    chars: new Map<string, Character>(),
  };

  private async initialize() {
    /* commands */
    Command.set('background <images>').action((args) => this.background(args[0]));
    Command.set('character <identity>')
      .option('N', 'name:string')
      .option('F', 'figure:string')
      .action((args, opts) => {
        this.character(args[0], opts);
      });
    Command.set('show <identity>')
      .option('H', 'hide:boolean')
      .option('F', 'figure:string')
      .action((args, opts) => {
        const option: CharacterOption = { show: !opts.hide };
        if (opts.figure) option.figure = opts.figure;
        this.character(args[0], option);
      });
    Command.set('say <message>')
      .option('S', 'speaker:string')
      .option('C', 'color:string')
      .action((args, opts) => {
        const { speaker } = opts;
        if (!speaker || speaker === 'think') return this.text(args[0]);
        return this.text(`⌈${args[0]}⌋`, this.els.chars.get(speaker)?.name ?? speaker);
      });
    Command.set('pause')
      .option('T', 'time')
      .action((_, opts) => this.pause(undefined, opts.time !== undefined ? Number(opts.time) : undefined));
    Command.set('music <filename>').action((args) => Media.playMusic(args[0]));
    /* elements */
    const { styles: s } = this.ctx.config;
    await this.background(s.background);
    this.character('unknown', { name: '???' });
    const dialog = await loadAssets(s.dialog, { width: this.ctx.width() });
    dialog.position.set(this.ctx.calcX(s.dialogX), this.ctx.calcY(s.dialogY));
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
    this.ctx.ctn.after.addChild(dialog, this.els.name, this.els.msg);
  }

  public async load() {
    await this.initialize();
    this.ctx.emit('initialized');
    if (!State.script) State.script = this.ctx.config.entry;
    await new Parser().run().catch((e) => logger.error(e));
  }

  public async background(assets: string) {
    if (this.els.bg) this.ctx.ctn.before.removeChild(this.els.bg);
    this.els.chars.forEach((char) => char.hide());
    const el = await loadAssets(assets);
    el.width = this.ctx.width();
    el.height = this.ctx.height();
    this.ctx.ctn.before.addChild(el);
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
      this.ctx.once('nextdialog', () => {
        if (callback) callback();
        resolve(undefined);
      });
    });
  }

  // TODO: html tag supports
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
      }, 30);
      this.ctx.once('resize', () => clearTimeout(timerId));
    };
    timer();
    return this.pause(() => clearTimeout(timerId));
  }
}

export default DialogPage;
