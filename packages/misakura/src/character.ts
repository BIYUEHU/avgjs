import { Sprite } from 'PIXI.js';
import type { Visual } from './visual';
import loadAssets from './utils/loadAssets';

interface Option {
  name?: string;
  assets?: string;
  view?: boolean;
}

export class Character {
  private el?: Sprite;

  private readonly ctx: Visual;

  protected readonly identity: string;

  private option: Option;

  private isView = false;

  public constructor(ctx: Visual, identity: string, option: Option) {
    this.ctx = ctx;
    this.identity = identity;
    this.option = option;
    if (!this.option.assets) return;
    loadAssets(this.option.assets).then((el) => {
      el.scale.set(this.ctx.calcH(el.height / 1080) / el.height);
      if (this.option.view || this.isView) {
        this.isView = false;
        this.view();
      }
      this.el = el;
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
    return this.ctx.text(`「${text}」`);
  }
}

export default Character;
