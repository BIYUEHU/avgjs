import { Text, Graphics } from 'pixi.js'
// import { loadAssets } from '../Ui/utils/loader'
import { LayerLevel } from '../types'
import SidebarPageAbstract from './SidebarPageAbstract'
import pkg from '../../package.json'
import { sleep } from '@kotori-bot/core'
import { createAutoLayout } from '../Ui/utils/layout'
import { loadAssets } from '../Ui/utils/loader'

export class HomePage extends SidebarPageAbstract {
  public readonly level = LayerLevel.MIDDLE

  public async init() {
    // const opts = { width: this.ctx.width(), height: this.ctx.height() }
    // this.layer.add([await loadAssets('/gui/home/background.png', opts)], LayerLevel.AFTER)
    /* title */
    const title = new Text('視覚小説ゲームテスト', {
      fontFamily: 'Noto Sans JP',
      fontSize: 100,
      fill: 0x00fff0
    })
    const subtitle = new Text('Visual novel game demonstration', {
      fontFamily: 'Raleway',
      fontSize: 50,
      fill: 0x00ccc0
    })
    title.anchor.set(1, 0)
    subtitle.anchor.set(1, 0)
    title.position.set(1880, 50)
    subtitle.position.set(1790, 160)

    /* bottom information */
    const style2 = {
      fontFamily: 'Raleway',
      fontSize: 40,
      fill: 0x00b4ff
    }
    const version = new Text(`v${pkg.version}`, style2)
    const copyright = new Text('© 2024 Arimura Sena', style2)
    version.anchor.set(1, 1)
    copyright.anchor.set(1, 1)
    version.position.set(1910, 1020)
    copyright.position.set(1910, 1070)
    this.layer.add([version, copyright, title, subtitle], LayerLevel.BEFORE)
  }

  public async load() {
    const history = this.ctx.store.getHistoryPage()
    if (history.length === 0 || (history.length === 1 && history[0] === 'dialog')) {
      const background = new Graphics()
      background.beginFill('#fff')
      background.drawRect(0, 0, this.ctx.width(), this.ctx.height())
      background.endFill()
      this.layer.add(background, LayerLevel.BEFORE)

      await sleep(500)

      const layout = createAutoLayout(
        [
          await loadAssets('/misakura.svg', { width: 150, height: 150 }),
          new Text('AvgJS | Misakura', {
            fontSize: 80,
            fill: 'pink',
            align: 'center'
          })
        ],
        {
          pos: [this.ctx.width() / 2 - 190, this.ctx.height() / 2],
          direction: 'row',
          spacing: 40
        },
        (sprite) => sprite
      )

      this.layer.add(layout, LayerLevel.BEFORE)

      await sleep(3000)

      this.layer.remove(layout)

      await sleep(400)

      const author = new Text('By Arimura Sena', {
        fontSize: 75,
        fill: 'deepskyblue',
        align: 'center'
      })
      author.anchor.set(0.5, 0.5)
      author.position.set(this.ctx.width() / 2, this.ctx.height() / 2)
      this.layer.add(author, LayerLevel.BEFORE)

      await sleep(2700)

      this.layer.remove(author)

      await sleep(500)

      this.layer.remove(background)
    }
    this.ctx.store.clearHistoryPage()
  }
}

export default HomePage
