import { TextStyle } from 'pixi.js';
import loadAssets from '../utils/loadAssets';
import Page from '../utils/page';

export class HomePage extends Page {
  public async load() {
    // const blur = new BlurFilter();
    // blur.blur = 0.7;
    const opts = { width: this.ctx.width(), height: this.ctx.height() };
    this.ctx.ctn.before.addChild(
      await loadAssets('/gui/home/background1.png', opts),
      await loadAssets('/gui/home/foreground.png', opts)
    );
    const textStyle = new TextStyle({
      fontSize: this.ctx.calcY(52),
    });
    // const text1 = new Text()
  }
}

export default HomePage;
