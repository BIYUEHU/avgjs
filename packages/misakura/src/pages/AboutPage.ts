import { LayerLevel } from '../types'
import SidebarPageAbstract from './SidebarPageAbstract'
import type Context from '../'

export class AboutPage extends SidebarPageAbstract {
  public readonly level = LayerLevel.MIDDLE

  public constructor(ctx: Context) {
    super(ctx, 'ABOUT', 'About')
  }

  public async init() {}
}

export default AboutPage
