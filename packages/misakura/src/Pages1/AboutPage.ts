import { Text } from 'PIXI.JS'
import { LayerLevel } from '../types'
import SidebarPageAbstract from './SidebarPageAbstract'
import type Context from '../'
import { createAutoLayout } from '../Ui/utils/layout'

export class AboutPage extends SidebarPageAbstract {
  public readonly level = LayerLevel.MIDDLE

  public constructor(ctx: Context) {
    super(ctx, 'ABOUT', 'About')
  }

  public async init() {
    const layout = createAutoLayout(
      [
        "Here are some producer's words",
        '1.The project are developing and improving constantly.',
        '2.Docs: https://avg.js.org',
        '3.Github: https://github.com/biyuehu/misakura'
      ],
      { direction: 'down', pos: [1200, 370], spacing: 10 },
      (content) =>
        new Text(content, {
          fill: 0xee1111,
          fontSize: 45
        })
    )
    this.layer.add(layout)
  }
}

export default AboutPage
