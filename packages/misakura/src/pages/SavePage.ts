import { Graphics } from 'PIXI.JS'
import { LayerLevel } from '../types'
import SidebarPageAbstract from './SidebarPageAbstract'
import type Context from '../'

export class SavePage extends SidebarPageAbstract {
  public readonly level = LayerLevel.MIDDLE

  public constructor(ctx: Context) {
    super(ctx, 'SAVE', 'Save')
  }

  public async init() {
    const line = new Graphics()
    line.lineStyle(2, 0x000, 1)
    line.moveTo(0, 160)
    this.layer.add([line], LayerLevel.BEFORE)
  }
}

export default SavePage
