import { Events } from '@kotori-bot/tools';
import { event } from '@tauri-apps/api';
import { Application, Sprite, Container, Text, TextStyle } from 'PIXI.js';
import { TauriEvent } from '@tauri-apps/api/event';
import Character from './character';
import loadAssets from './utils/loadAssets';

interface EventsList {
  view_click(): void;
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

  private isView = false;

  public channel = {
    bg: new Sprite(),
    text: new Text(),
    characters: new Map<string, Character>(),
  };

  public ctn = {
    before: new Container(),
    middle: new Container(),
    after: new Container(),
  };

  public app: Application;

  private async initialize() {
    /* register */
    document.addEventListener('keydown', (event) => {
      if (event.key === 'F5') event.preventDefault();
    });
    event.listen(TauriEvent.WINDOW_RESIZED, () => window.location.reload());
    /* channel */
    const dialog = await loadAssets('/gui/dialog.png');
    this.app.stage.addChild(...Object.values(this.ctn));
    dialog.width = this.width();
    dialog.position.set(undefined, this.calcH(0.73));
    this.channel.text.style = new TextStyle({
      breakWords: true,
      wordWrap: true,
      wordWrapWidth: this.calcW(0.9),
      fontSize: this.calcH(0.036, 16, 55),
    });
    this.channel.text.position.set(this.calcW(0.05, undefined, 200), this.calcH(0.79));
    this.ctn.after.addChild(dialog, this.channel.text);
  }

  public constructor(option: Exclude<ConstructorParameters<typeof Application>[0], 'width' | 'height'> = {}) {
    super();
    this.app = new Application({ ...Visual.getWindow(), ...option });
    this.initialize();
  }

  public view(element: HTMLElement = document.body) {
    if (this.isView) return;
    element.appendChild(this.app.view as unknown as Node);
    document.addEventListener('click', () => this.emit('view_click'));
    this.isView = true;
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

  public async background(assets: string) {
    if (this.channel.bg) this.ctn.before.removeChild(this.channel.bg);
    const el = await loadAssets(assets);
    el.width = this.width();
    el.height = this.height();
    this.ctn.before.addChild(el);
    this.channel.bg = el;
  }

  public character(identity: string, option: ConstructorParameters<typeof Character>[2] = {}) {
    const instance = new Character(this, identity, option);
    this.channel.characters.set(identity, instance);
    return instance;
  }

  public async text(text: string) {
    this.channel.text.text = text;
    return new Promise<void>((reject) => {
      this.once('view_click', () => reject(undefined));
    });
  }
}

export default Visual;
