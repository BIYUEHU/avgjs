import { Application } from 'PIXI.js';
import { Context } from '../context';
import getWindow from '../tools/getWindow';

declare module '../context' {
  interface Context {
    app: Stage['app'];
    height: Stage['height'];
    width: Stage['width'];
    calcX: Stage['calcX'];
    calcY: Stage['calcY'];
  }
}

export class Stage {
  public readonly app: Application;

  public constructor(ctx: Context) {
    this.app = new Application({ ...getWindow(), ...(ctx.config.render ?? {}) });
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
}

export default Stage;
