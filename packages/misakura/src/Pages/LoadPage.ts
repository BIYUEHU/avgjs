import { LayerLevel } from '../types'
import type Context from '../'
import { LevelsPageAbstract } from './LevelsPageAbstract'

export class LoadPage extends LevelsPageAbstract {
  public readonly level = LayerLevel.MIDDLE

  public constructor(ctx: Context) {
    super(ctx, 'LOAD')
  }

  public async init() {}
}

export default LoadPage
