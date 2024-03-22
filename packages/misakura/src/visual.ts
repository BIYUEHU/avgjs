import { Events } from '@kotori-bot/tools';
import { event } from '@tauri-apps/api';
import { Application, Sprite, Container, Text, TextStyle } from 'PIXI.js';
import { TauriEvent } from '@tauri-apps/api/event';
import Character from './character';
import loadAssets from './tools/loadAssets';
import State, { StateType } from './components/state';
import Parser from './components/parser';
import { DEFAULT_VISUAL_OPTION } from './const';

interface EventsList {
  view_click(): void;
}

interface VisualOption {
  render?: Exclude<ConstructorParameters<typeof Application>[0], 'width' | 'height'>;
  styles?: {
    background?: string;
    dialog?: string;
    dialogX?: number;
    dialogY?: number;
    dialogNameX?: number;
    dialogNameY?: number;
    dialogNameSize?: number;
    dialogMsgX?: number;
    dialogMsgY?: number;
    dialogMsgWrap?: number;
    dialogMsgSize?: number;
    margin?: number;
    characterHeight?: number;
  };
  entry: string;
}

interface CharacterOption {
  name?: string;
  figure?: string;
  show?: boolean;
}

type RequiredCycle<T extends object> = {
  [K in keyof T]-?: T[K] extends object ? RequiredCycle<T[K]> : Required<T[K]>;
};

export class Visual extends Events<EventsList> {
  private static getWindow() {
    const { innerWidth: windowW, innerHeight: windowH } = window;
    if (windowW / windowH < 16 / 9) return { width: windowW, height: (windowW * 9) / 16 };
    return { width: (windowH * 16) / 9, height: windowH };
  }

  private isShow = false;

  public readonly option: RequiredCycle<Omit<VisualOption, 'render'>> & { render?: VisualOption['render'] };

  public readonly elements = {
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

  public readonly app: Application;

  private async initialize() {
    /* register */
    document.addEventListener('keydown', (event) => {
      if (event.key === 'F5') event.preventDefault();
    });
    event.listen(TauriEvent.WINDOW_RESIZED, () => window.location.reload());
    /* elements */
    const { styles: s } = this.option;
    this.character('unknown', { name: '???' });
    const dialog = await loadAssets(s.dialog);
    this.app.stage.addChild(...Object.values(this.ctn));
    dialog.position.set(this.calcX(s.dialogX), this.calcY(s.dialogY));
    dialog.width = this.width();
    dialog.height = this.height() - dialog.y;
    this.elements.name.position.set(this.calcX(s.dialogNameX), this.calcY(s.dialogNameY));
    this.elements.name.style = new TextStyle({
      fontSize: this.calcY(s.dialogNameSize),
    });
    this.elements.msg.position.set(this.calcX(s.dialogMsgX), this.calcY(s.dialogMsgY));
    this.elements.msg.style = new TextStyle({
      breakWords: true,
      wordWrap: true,
      wordWrapWidth: this.calcX(s.dialogMsgWrap),
      fontSize: this.calcY(s.dialogMsgSize),
    });
    this.ctn.after.addChild(dialog, this.elements.name, this.elements.msg);
  }

  public constructor(option?: VisualOption) {
    super();
    const opt = option ?? ({} as VisualOption);
    opt.styles = { ...DEFAULT_VISUAL_OPTION.styles, ...('styles' in opt ? opt.styles : {}) };
    this.option = { ...DEFAULT_VISUAL_OPTION, ...opt } as typeof this.option;
    this.app = new Application({ ...Visual.getWindow(), ...(this.option.render ?? {}) });
    this.initialize();
  }

  public view(element: HTMLElement = document.body) {
    if (this.isShow) return;
    element.appendChild(this.app.view as unknown as Node);
    document.addEventListener('click', () => this.emit('view_click'));
    this.background(this.option.styles.background);
    this.isShow = true;
  }

  public width() {
    return this.app.screen.width;
  }

  public height() {
    return this.app.screen.height;
  }

  public calcX(value: number = 1, rate: number = 1) {
    const origin = rate * this.width();
    if (value >= 1) return value * (origin / 1920);
    return value * origin;
  }

  public calcY(value: number = 1, rate: number = 1) {
    const origin = rate * this.height();
    if (value >= 1) return value * (origin / 1080);
    return value * origin;
  }

  public async play(option?: { script: string; index?: number }) {
    const { script, index } = option || {};
    const state = State.get() as StateType['dialog'];
    if (state.state !== 'dialog') state.state = 'dialog';
    if (script) {
      state.script = script;
      state.index = index ?? 0;
    } else if (!state.script) {
      state.script = this.option.entry;
      state.index = 0;
    }
    await new Parser(this).run();
  }

  public async background(assets: string) {
    if (this.elements.bg) this.ctn.before.removeChild(this.elements.bg);
    const el = await loadAssets(assets);
    el.width = this.width();
    el.height = this.height();
    this.ctn.before.addChild(el);
    this.elements.bg = el;
  }

  public async character(identity: string, option: CharacterOption) {
    const { name, show, figure } = option;
    let char = this.elements.chars.get(identity);
    if (!char) {
      char = new Character(this, identity, name);
      this.elements.chars.set(identity, char);
    } else if (name !== undefined) char.display(name);
    if (show !== undefined) char[show ? 'view' : 'hide']();
    if (figure !== undefined) await char.figure(figure);
    return char;
  }

  public async text(text: string, name: string = '') {
    this.elements.msg.text = text;
    this.elements.name.text = name;
    return new Promise<void>((reject) => {
      this.once('view_click', () => reject(undefined));
    });
  }
}

export default Visual;
