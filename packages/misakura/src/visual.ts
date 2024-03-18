import { Application, Assets, Sprite, Container, Text, TextStyle } from 'PIXI.js';
import Character from './character';

function calcHandle(result: number, min?: number, max?: number) {
  if (min) return result < min ? min : result;
  if (max) return result > max ? max : result;
  return result;
}

export class Visual {
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
    this.app.stage.addChild(...Object.values(this.ctn));
    const el = await this.loadAssets('/gui/dialog.png');
    el.width = this.width();
    el.position.set(undefined, this.calcH(0.73));
    this.channel.text.style = new TextStyle({
      breakWords: true,
      wordWrap: true,
      wordWrapWidth: this.calcW(0.9),
      fontSize: this.calcH(0.036, 16, 55),
    });
    this.channel.text.position.set(this.calcW(0.05, undefined, 200), this.calcH(0.79));
    this.ctn.after.addChild(el, this.channel.text);
  }

  public constructor(option?: ConstructorParameters<typeof Application>[0]) {
    this.app = new Application(option);
    this.initialize();
  }

  public view(element: HTMLElement = document.body) {
    if (this.isView) return;
    element.appendChild(this.app.view as unknown as Node);
    this.isView = true;
  }

  public width() {
    return this.app.screen.width;
  }

  public height() {
    return this.app.screen.height;
  }

  public calcW(rate: number, min?: number, max?: number) {
    return calcHandle(rate * this.width(), min, max);
  }

  public calcH(rate: number, min?: number, max?: number) {
    return calcHandle(rate * this.height(), min, max);
  }

  public async loadAssets(assets: string) {
    const texture = await Assets.load(assets);
    return new Sprite(texture);
  }

  public addEl(...elements: Sprite[]) {
    this.ctn.middle.addChild(...elements);
  }

  public removeEl(...elements: Sprite[]) {
    this.ctn.middle.removeChild(...elements);
  }

  public async background(assets: string) {
    if (this.channel.bg) this.removeEl(this.channel.bg);
    const el = await this.loadAssets(assets);
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
  }
}

export default Visual;
