import { Text } from 'PIXI.JS'
import { loadAssets } from '../Ui/utils/loader'
import { LayerLevel } from '../types'
import SidebarPageAbstract from './SidebarPageAbstract'

export class HomePage extends SidebarPageAbstract {
  public readonly level = LayerLevel.MIDDLE

  public async init() {
    const opts = { width: this.ctx.width(), height: this.ctx.height() }
    this.layer.add([await loadAssets('/gui/home/background.png', opts)], LayerLevel.AFTER)
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
    const version = new Text('v0.1.0', style2)
    const copyright = new Text('© 2024 Hotaru', style2)
    version.anchor.set(1, 1)
    copyright.anchor.set(1, 1)
    version.position.set(1910, 1020)
    copyright.position.set(1910, 1070)
    this.layer.add([version, copyright, title, subtitle], LayerLevel.BEFORE)
  }

  public load() {
    this.ctx.store.clearHistoryPage()
  }
}

export default HomePage
