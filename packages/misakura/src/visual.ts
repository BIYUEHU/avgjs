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
  entry: string;
}

export class Visual extends Events<EventsList> {
  private static calcHandle(result: number, min?: number, max?: number) {
    if (min) return result < min ? min : result;
    if (max) return result > max ? max : result;
    return result;
  }

  private static getWindow() {
    const { innerWidth: windowW, innerHeight: windowH } = window;
    if (windowW / windowH < 16 / 9) return { width: windowW, height: (windowW * 9) / 16 };
    return { width: (windowH * 16) / 9, height: windowH };
  }

  private readonly option: VisualOption;

  private isShow = false;

  public readonly elements = {
    bg: new Sprite(),
    text: new Text(),
    name: new Text(),
    characters: new Map<string, Character>(),
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
    this.character('unknown', { name: '???' });
    const dialog = await loadAssets('/gui/dialog.png');
    this.app.stage.addChild(...Object.values(this.ctn));
    dialog.width = this.width();
    dialog.position.set(undefined, this.calcH(0.72));
    this.elements.name.style = new TextStyle({
      breakWords: true,
      wordWrap: true,
      wordWrapWidth: this.calcW(0.9),
      fontSize: this.calcH(0.045, 18, 60),
    });
    this.elements.name.position.set(this.calcW(0.045, undefined, 180), this.calcH(0.72));
    this.elements.text.style = new TextStyle({
      breakWords: true,
      wordWrap: true,
      wordWrapWidth: this.calcW(0.9),
      fontSize: this.calcH(0.036, 16, 55),
    });
    this.elements.text.position.set(this.calcW(0.05, undefined, 200), this.calcH(0.79));
    this.ctn.after.addChild(dialog, this.elements.name, this.elements.text);
  }

  public constructor(option: VisualOption = DEFAULT_VISUAL_OPTION) {
    super();
    this.option = option;
    this.app = new Application({ ...Visual.getWindow(), ...(this.option.render ?? {}) });
    this.initialize();
  }

  public view(element: HTMLElement = document.body) {
    if (this.isShow) return;
    element.appendChild(this.app.view as unknown as Node);
    document.addEventListener('click', () => this.emit('view_click'));
    this.isShow = true;
  }

  public width() {
    return this.app.screen.width;
  }

  public height() {
    return this.app.screen.height;
  }

  public calcW(rate: number, min?: number, max?: number) {
    return Visual.calcHandle(rate * this.width(), min, max);
  }

  public calcH(rate: number, min?: number, max?: number) {
    return Visual.calcHandle(rate * this.height(), min, max);
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

  public character(identity: string, option: ConstructorParameters<typeof Character>[2] = {}) {
    const instance = this.elements.characters.get(identity);
    if (!instance) {
      const instance = new Character(this, identity, option);
      this.elements.characters.set(identity, instance);
      return instance;
    }
    const { name, show, figure } = option;
    if (name !== undefined) instance.name(name);
    if (show !== undefined) instance[show ? 'view' : 'hide']();
    if (figure !== undefined) instance.figure(figure);
    return instance;
  }

  public async text(text: string, name: string = '') {
    this.elements.text.text = text;
    this.elements.name.text = name;
    return new Promise<void>((reject) => {
      this.once('view_click', () => reject(undefined));
    });
  }
}

export default Visual;
