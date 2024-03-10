import { Application, Assets, Sprite } from 'PIXI.js';

export class Visual {
  private BACKGROUND: Sprite | undefined;

  public app: Application;

  private async initialize() {
    const child = await this.loadAssets('/gui/dialog.png');
    child.position.set((this.width() * 2) / 3, (this.height() - this.height() / 16) / 2);
    child.zIndex = 100;
    this.addChild(child);
  }

  public constructor(option?: ConstructorParameters<typeof Application>[0]) {
    this.app = new Application(option);
    this.initialize();
  }

  public view(element: HTMLElement = document.body) {
    element.appendChild(this.app.view as unknown as Node);
  }

  public width() {
    return this.app.screen.width;
  }

  public height() {
    return this.app.screen.height;
  }

  public async loadAssets(assets: string) {
    const texture = await Assets.load(assets);
    return new Sprite(texture);
  }

  public addChild(...child: Sprite[]) {
    this.app.stage.addChild(...child);
  }

  public removeChild(...child: Sprite[]) {
    this.app.stage.removeChild(...child);
  }

  public async setBackground(assets: string) {
    if (this.BACKGROUND) this.removeChild(this.BACKGROUND);
    const child = await this.loadAssets(assets);
    child.zIndex = 10;
    child.width = this.width();
    child.height = this.height();
    this.addChild(child);
    this.BACKGROUND = child;
  }

  public async addCharcter(assets: string) {
    const child = await this.loadAssets(assets);
    child.position.set(this.width() / 3, (this.height() - this.height() / 16) / 20);
    child.zIndex = 20;
    this.addChild(child);
  }
}

export default Visual;
