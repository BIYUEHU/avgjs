import { LayerLevel } from '../types'
import SidebarPageAbstract from './SidebarPageAbstract'
import type Context from '../'

export class LoadPage extends SidebarPageAbstract {
  public readonly level = LayerLevel.MIDDLE

  public constructor(ctx: Context) {
    super(ctx, 'LOAD', 'Load')
  }

  public async init() {}
}

export default LoadPage
