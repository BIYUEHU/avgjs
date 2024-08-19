import { appWindow } from '@tauri-apps/api/window'
import { HTMLText, type Container } from 'PIXI.JS'
import loadAssets from '../utils/loadAssets'
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
        setDialogData({ entry: this.ctx.config.entry, line: 0 })
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
        this.ctx.pages.extra.setActive(true)
      }
    ],
    [
      'CONFIG',
      () => {
        this.ctx.pages.config.setActive(true)
      }
    ],
    [
      'ABOUT',
      () => {
        this.ctx.pages.about.setActive(true)
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

  private async preInit() {
    const opts = { width: this.ctx.width(), height: this.ctx.height() }
    this.layer.add(
      [await loadAssets('/gui/home/background1.png', opts), await loadAssets('/gui/home/foreground.png', opts)],
      LayerLevel.AFTER
    )
  }

  private preLoad() {
    // title
    if (this.title) {
      const title = new HTMLText(`<strong>${this.title}</strong>`, { fontSize: 65, fill: 0x0099ff })
      title.position.set(80, 70)
      this.layer.add(title, LayerLevel.BEFORE)
    }
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

  public constructor(ctx: Context, light?: ButtonType, title?: string) {
    super(ctx)
    this.lightButton = light
    this.preInit()
    this.title = title
    this.ctx.on('page_active_change', (target) => {
      if (target === this) this.getActive() ? this.preLoad() : this.preDispose()
    })
  }
}

export default SidebarPageAbstract
