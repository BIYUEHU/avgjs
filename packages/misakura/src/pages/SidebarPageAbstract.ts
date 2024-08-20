import { appWindow } from '@tauri-apps/api/window'
import { HTMLText, type Container } from 'PIXI.JS'
import { loadAssets } from '../Ui/utils/loader'
import { Page } from '../class'
import { LayerLevel } from '../types'
import { getDialogScript, getHistoryPage, setDialogData } from '../store'
import { SpriteButton } from '../Ui/button/SpriteButton'
import { createLayout } from '../Ui/utils/layout'
import type Context from '../app'

type ButtonType = 'START' | 'TITLE' | 'CONTINUE' | 'LOAD' | 'SAVE' | 'EXTRA' | 'CONFIG' | 'ABOUT' | 'EXIT'

export abstract class SidebarPageAbstract extends Page {
  private readonly lightButton?: ButtonType

  private readonly title?: string

  private readonly buttonConfigList = [
    [
      'START',
      () => {
        setDialogData({ entry: this.ctx.config.entry, line: 0, part: 0, count: 0 })
        this.ctx.pages.dialog.setActive()
      }
    ],
    [
      'TITLE',
      () => {
        this.ctx.pages.home.setActive()
      }
    ],
    [
      'CONTINUE',
      () => {
        if (!getDialogScript()) return
        this.ctx.pages.dialog.setActive()
      }
    ],
    [
      'LOAD',
      () => {
        this.ctx.pages.load.setActive(true)
      }
    ],
    [
      'SAVE',
      () => {
        if (!getDialogScript()) return
        this.ctx.pages.save.setActive()
      }
    ],
    [
      'EXTRA',
      () => {
        this.ctx.pages.extra.setActive()
      }
    ],
    [
      'CONFIG',
      () => {
        this.ctx.pages.config.setActive()
      }
    ],
    [
      'ABOUT',
      () => {
        this.ctx.pages.about.setActive()
      }
    ],
    [
      'EXIT',
      () => {
        this.ctx.clear()
        appWindow.close()
      }
    ]
  ] as const

  private buttonLayout?: Container

  private background: string

  private async preLoad() {
    // title
    if (this.title) {
      const title = new HTMLText(`<strong>${this.title}</strong>`, { fontSize: 65, fill: 0x0099ff })
      title.position.set(80, 70)
      this.layer.add(title, LayerLevel.BEFORE)
    }
    // background
    const opts = { width: this.ctx.width(), height: this.ctx.height() }
    this.layer.add(
      this.background
        ? [await loadAssets(this.background, opts), await loadAssets('/gui/home/foreground.png', opts)]
        : await loadAssets('/gui/home/foreground.png', opts),
      LayerLevel.AFTER
    )
    // buttons
    this.buttonLayout = createLayout(
      this.buttonConfigList.filter(([name]) => {
        switch (name) {
          case 'START':
            return this.ctx.pages.home.getActive()
          case 'TITLE':
            return !this.ctx.pages.home.getActive()
          case 'CONTINUE':
            return (
              getDialogScript() &&
              (getHistoryPage().some((page) => ['home', 'dialog'].includes(page)) || this.ctx.pages.home.getActive())
            )
          case 'SAVE':
            return getDialogScript() && getHistoryPage().includes('dialog')
          default:
            return ['ABOUT', 'EXTRA'].includes(name)
              ? getHistoryPage().includes('home') || this.ctx.pages.home.getActive()
              : true
        }
      }),
      ([text, callback], index) => {
        const isSelf = text === this.lightButton
        const button = new SpriteButton(
          text,
          (type) => {
            if (type === 'onPress' && !isSelf) callback()
          },
          {
            style: { fontSize: 43, fill: isSelf ? 0x0064ff : 0x00b4ff },
            hoverStyle: { fill: isSelf ? 0x0064ff : 0x0099ff },
            pressedStyle: { fill: 0x0064ff }
          }
        )
        button.view.position.set(120, 420 + index * 60)
        return button.view
      }
    )
    this.layer.add(this.buttonLayout)
  }

  private preDispose() {
    this.buttonLayout?.destroy()
  }

  public constructor(ctx: Context, light?: ButtonType, title?: string, background = '/gui/home/background1.png') {
    super(ctx)
    this.lightButton = light
    this.title = title
    this.background = background
    this.ctx.on('page_active_change', (target) => {
      if (target === this) this.getActive() ? this.preLoad() : this.preDispose()
    })
  }
}

export default SidebarPageAbstract
