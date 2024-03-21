import { Sprite } from 'PIXI.js';
import type { Visual } from './visual';
import loadAssets from './tools/loadAssets';

interface Option {
  name?: string;
  figure?: string;
  show?: boolean;
}

export class Character {
  private el?: Sprite;

  private readonly ctx: Visual;

  protected readonly identity: string;

  private option: Option;

  private isShow = false;

  public constructor(ctx: Visual, identity: string, option: Option) {
    this.ctx = ctx;
    this.identity = identity;
    this.option = option;
    if (this.option.figure) this.figure(this.option.figure);
  }

  public view() {
    if (this.isShow) return;
    this.isShow = true;
    if (!this.el) return;
    this.ctx.ctn.middle.addChild(this.el);
  }

  public hide() {
    if (!this.isShow) return;
    this.isShow = false;
    if (!this.el) return;
    this.ctx.ctn.middle.removeChild(this.el);
  }

  public text(text: string) {
    return this.ctx.text(`「${text}」`, this.option.name);
  }

  public async figure(figure: string) {
    const el = await loadAssets(figure);
    el.scale.set(this.ctx.calcH(el.height / 1080) / el.height);
    this.el = el;
    if (!this.option.show && !this.isShow) return;
    this.hide();
    this.view();
  }

  public name(name: string) {
    this.option.name = name;
  }
}

export default Character;
