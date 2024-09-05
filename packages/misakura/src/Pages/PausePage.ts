import { LayerLevel } from '../types'
import SidebarPageAbstract from './SidebarPageAbstract'
import type Context from '../'

export class PausePage extends SidebarPageAbstract {
  public readonly level = LayerLevel.BEFORE

  public constructor(ctx: Context) {
    super(ctx, undefined, 'Pause', '')
  }

  public async init() {}
}

export default PausePage
