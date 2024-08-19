import { LayerLevel } from '../types'
import SidebarPageAbstract from './SidebarPageAbstract'
import type Context from '../'

export class ExtraPage extends SidebarPageAbstract {
  public readonly level = LayerLevel.MIDDLE

  public constructor(ctx: Context) {
    super(ctx, 'EXTRA', 'Extra')
  }

  public async init() {}
}

export default ExtraPage
