import { Sprite } from 'PIXI.js';
import loadAssets from './loadAssets';
import type { Context } from '../context';

export class Character {
  private el?: Sprite;

  private readonly ctx: Context;

  private isShow = false;

  public readonly identity: string;

  public name: string;

  public constructor(ctx: Context, identity: string, name?: string) {
    this.ctx = ctx;
    this.identity = identity;
    this.name = name ?? identity;
  }

  public view(position: 'auto' | 'left' | 'center' | 'right' = 'auto') {
    if (this.isShow) return;
    this.isShow = true;
    if (!this.el) return;
    this.ctx.ctn.middle.addChild(this.el);
    if (position === 'auto') {
      const chars: Character[] = [];
      this.ctx.els.chars.forEach((char) => char.isShow && chars.push(char));
      const margin = 1 - (this.ctx.config.styles.margin * 2) / this.ctx.width();
      const spacing = 1 / (chars.length + 1);
      const height = this.ctx.calcY(718);
      chars.forEach((char, index) =>
        char.el?.position.set(this.ctx.calcX(spacing * (index + 1), margin) + this.ctx.config.styles.margin, height)
      );
    }
  }

  public hide() {
    if (!this.isShow) return;
    this.isShow = false;
    if (!this.el) return;
    this.ctx.ctn.middle.removeChild(this.el);
  }

  public async figure(figure: string) {
    const oldEl = this.el;
    const el = await loadAssets(figure);
    el.anchor.set(0.5, 0.5);
    el.scale.set(this.ctx.calcX(), this.ctx.calcY());
    this.el = el;
    if (!this.isShow) return;
    const index = this.ctx.ctn.middle.children.findIndex((el) => el === oldEl);
    if (!oldEl || index === undefined) {
      this.hide();
      this.view();
      return;
    }
    this.el.position.set(oldEl.x, oldEl.y);
    this.ctx.ctn.middle.removeChildAt(index);
    this.ctx.ctn.middle.addChildAt(this.el, index);
  }

  public display(name: string) {
    this.name = name;
  }
}

export default Character;
