import { Application, Container } from 'PIXI.js';
import { event } from '@tauri-apps/api';
import { TauriEvent } from '@tauri-apps/api/event';
import { Context } from '../context';
import getWindow from '../tools/getWindow';
import { type PageType, State } from '../tools/state';
// import { loadFonts } from '../tools/loadFont';

declare module '../context' {
  interface Context {
    app: Controller['app'];
    ctn: Controller['ctn'];
    checkout: Controller['checkout'];
    view: Controller['view'];
    height: Controller['height'];
    width: Controller['width'];
    calcX: Controller['calcX'];
    calcY: Controller['calcY'];
  }
}

export class Controller {
  private readonly ctx: Context;

  public readonly app: Application;

  public ctn = {
    before: new Container(),
    middle: new Container(),
    after: new Container(),
  };

  private renderTime?: number;

  public constructor(ctx: Context) {
    this.ctx = ctx;
    this.app = new Application({ ...getWindow(), antialias: true, resolution: 1, ...(this.ctx.config.render ?? {}) });
    this.app.stage.addChild(...Object.values(this.ctn));
  }

  public checkout<T extends PageType>(page?: T) {
    if (page) State.page = page;
    Object.keys(this.ctn).forEach((key) => this.ctn[key as 'before'].removeChildren(0));
    this.ctx.offAll('nextdialog');
    return this.ctx[page ?? State.page].load();
  }

  public view(element: HTMLElement = document.body) {
    event.listen(TauriEvent.WINDOW_RESIZED, () => {
      if (this.renderTime && new Date().getTime() - this.renderTime <= 300) return;
      this.ctx.emit('resize');
      const { width, height } = getWindow();
      this.app.renderer.resize(width, height);
      this.ctx.once('initialized', () => {
        this.renderTime = new Date().getTime();
      });
      this.checkout().then(() => {
        this.renderTime = new Date().getTime();
      });
    });
    element.appendChild(this.app.view as unknown as Node);
    element.addEventListener('click', () => {
      if (State.page === 'dialog') this.ctx.emit('nextdialog');
    });
    document.body.addEventListener('contextmenu', (event) => event.preventDefault());
    document.body.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'F5':
          event.preventDefault();
          break;
        case 'Enter':
          if (State.page === 'dialog') this.ctx.emit('nextdialog');
          break;
        case 'Control':
          break;
        default:
      }
    });
    // await loadFonts([
    //   ['Raleway', 'https://fonts.gstatic.font.im/s/raleway/v29/1Ptug8zYS_SKggPNyCAIT5lu.woff2'],
    //   [
    //     'Noto Sans JP',
    //     'https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.0.woff2',
    //   ],
    //   ['Orbitron', 'https://fonts.gstatic.font.im/s/orbitron/v31/yMJRMIlzdpvBhQQL_Qq7dy0.woff2'],
    // ]);
    document.fonts.ready.then(() => this.checkout());
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

export default Controller;
