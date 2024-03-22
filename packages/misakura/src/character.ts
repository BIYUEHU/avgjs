import { Sprite } from 'PIXI.js';
import type { Visual } from './visual';
import loadAssets from './tools/loadAssets';

export class Character {
  private el?: Sprite;

  private readonly ctx: Visual;

  private name?: string;

  private isShow = false;

  public readonly identity: string;

  public constructor(ctx: Visual, identity: string, name?: string) {
    this.ctx = ctx;
    this.identity = identity;
    if (name) this.display(name);
  }

  public view(position: 'auto' | 'left' | 'center' | 'right' = 'auto') {
    if (this.isShow) return;
    this.isShow = true;
    if (!this.el) return;
    this.ctx.ctn.middle.addChild(this.el);
    if (position === 'auto') {
      const chars: Character[] = [];
      this.ctx.elements.chars.forEach((char) => char.isShow && chars.push(char));
      const margin = 1 - (this.ctx.option.styles.margin * 2) / this.ctx.width();
      const spacing = 1 / (chars.length + 1);
      const height = this.ctx.calcY(718);
      chars.forEach((char, index) =>
        char.el?.position.set(this.ctx.calcX(spacing * (index + 1), margin) + this.ctx.option.styles.margin, height)
      );
    }
  }

  public hide() {
    if (!this.isShow) return;
    this.isShow = false;
    if (!this.el) return;
    this.ctx.ctn.middle.removeChild(this.el);
  }

  public text(text: string) {
    return this.ctx.text(`「${text}」`, this.name ?? this.identity);
  }

  public async figure(figure: string) {
    const el = await loadAssets(figure);
    el.anchor.set(0.5, 0.5);
    el.scale.set(this.ctx.calcX(), this.ctx.calcY());
    this.el = el;
    if (!this.isShow) return;
    this.hide();
    this.view();
  }

  public display(name: string) {
    this.name = name;
  }
}

export default Character;
