import { Sprite } from 'PIXI.js';
import type { Visual } from './visual';

interface Option {
  name?: string;
  assets?: string;
  view?: boolean;
}

export class Character {
  private el?: Sprite;

  private ctx: Visual;

  private identity: string;

  private option: Option;

  private isView = false;

  public constructor(ctx: Visual, identity: string, option: Option) {
    this.ctx = ctx;
    this.identity = identity;
    this.option = option;
    if (!this.option.assets) return;
    this.ctx.loadAssets(this.option.assets).then((el) => {
      el.scale.set(this.ctx.calcH(el.height / 1080) / el.height);
      this.el = el;
      if (this.option.view) this.view();
    });
  }

  public view() {
    if (!this.el) return;
    if (this.isView) return;
    this.ctx.ctn.middle.addChild(this.el);
    this.isView = true;
  }

  public hide() {
    if (!this.el) return;
    if (!this.isView) return;
    this.ctx.ctn.middle.removeChild(this.el);
    this.isView = false;
  }

  public text(text: string) {
    this.ctx.text(`「${text}」`);
  }
}

export default Character;
