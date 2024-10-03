import { LayerLevel } from '../types'
import type Context from '../'
import { LevelsPageAbstract } from './LevelsPageAbstract'

export class SavePage extends LevelsPageAbstract {
  public readonly level = LayerLevel.MIDDLE

  public constructor(ctx: Context) {
    super(ctx, 'SAVE')
  }

  public async init() {
    /*     const line = new Graphics()
    line.lineStyle(2, 0x000, 1)
    line.moveTo(0, 160)
    this.layer.add(line, LayerLevel.BEFORE) */
  }
}

export default SavePage
