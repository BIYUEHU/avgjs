import { TextStyle, Text, Graphics } from 'PIXI.js';
import loadAssets from '../utils/loadAssets';
import Page from '../utils/page';

export class HomePage extends Page {
  private generateButton(content: string, height: number, callback: Exclude<Text['onclick'], null>) {
    const text = new Text(
      content,
      new TextStyle({
        fontFamily: 'Orbitron',
        fontSize: this.ctx.calcY(47),
        fill: 0x0099ff,
      })
    );

    const button = new Graphics();
    button.beginFill(0x0099ff);
    button.drawRect(0, text.height + 3, this.ctx.calcX(280), 3);
    button.endFill();
    button.position.set(this.ctx.calcX(120), this.ctx.calcY(height));
    button.interactive = true;

    button.on('pointerover', () => {
      button.tint = 0x0064ff;
      text.style.fill = 0x0064ff;
    });
    button.on('pointerout', () => {
      button.tint = 0x0099ff;
      text.style.fill = 0x0099ff;
    });
    button.on('pointerdown', () => {
      button.tint = 0x00b4ff;
      text.style.fill = 0x00b4ff;
    });
    button.on('pointerup', (...args) => {
      callback(...args);
      button.tint = 0x00c8ff;
      text.style.fill = 0x00c8ff;
    });
    button.addChild(text);
    this.ctx.ctn.after.addChild(button);
  }

  public async load() {
    const opts = { width: this.ctx.width(), height: this.ctx.height() };
    this.ctx.ctn.before.addChild(
      await loadAssets('/gui/home/background1.png', opts),
      await loadAssets('/gui/home/foreground.png', opts)
    );
    /* title */
    const title = new Text(
      '視覚小説ゲームテスト',
      new TextStyle({
        fontFamily: 'Noto Sans JP',
        fontSize: this.ctx.calcY(100),
        fill: 0x00fff0,
      })
    );
    const subtitle = new Text(
      'Visual novel game demonstration',
      new TextStyle({
        fontFamily: 'Raleway',
        fontSize: this.ctx.calcY(50),
        fill: 0x00ccc0,
      })
    );
    title.anchor.set(0.5, 0.5);
    subtitle.anchor.set(0.5, 0.5);
    title.position.set(this.ctx.calcX(1335), this.ctx.calcX(110));
    subtitle.position.set(this.ctx.calcX(1335), this.ctx.calcX(195));
    /* buttons */
    this.generateButton('START', 330, () => this.ctx.checkout('dialog'));
    this.generateButton('CONTINUE', 420, () => {});
    this.generateButton('EXTRA', 510, () => {});
    this.generateButton('CONFIG', 600, () => {});
    this.generateButton('ABOUT', 690, () => {});
    this.generateButton('EXIT', 780, () => {});
    /* bottom information */
    const style2 = new TextStyle({
      fontFamily: 'Raleway',
      fontSize: this.ctx.calcY(32),
      fill: 0x00b4ff,
    });
    const version = new Text('v0.1.0', style2);
    const copyright = new Text('© 2024 Hotaru', style2);
    version.anchor.set(1, 1);
    copyright.anchor.set(1, 1);
    version.position.set(this.ctx.calcX(1910), this.ctx.calcY(1025));
    copyright.position.set(this.ctx.calcX(1910), this.ctx.calcY(1070));
    this.ctx.ctn.before.addChild(version, copyright, title, subtitle);
  }
}

export default HomePage;
