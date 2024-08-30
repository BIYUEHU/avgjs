import type { Sprite } from 'PIXI.JS'
import '@kotori-bot/core'
import { loadAssets } from '../Ui/utils/loader'
import type DialogPage from '../Pages/DialogPage'

// type CharacterPositionType = 'auto' | 'left' | 'center' | 'right'

type CharacterPosition =
  | {
      type: 'auto'
      order: number
    }
  | {
      type: 'left' | 'center' | 'right'
      order: number
    }

export class Character {
  private readonly dialog: DialogPage

  public readonly identity: string

  private element?: Sprite

  public name: string

  public position?: CharacterPosition

  public figureAssets?: string

  public constructor(dialog: DialogPage, identity: string, name?: string) {
    this.dialog = dialog
    this.identity = identity
    this.name = name ?? identity
  }

  public isShow() {
    return this.element && this.dialog.layer.has(this.element)
  }

  public view(type: CharacterPosition['type'] = 'auto') {
    if (!this.element) return

    this.dialog.layer.add(this.element)
    if (type !== 'auto') return
    const chars = Array.from(this.dialog.els.chars.values()).filter((char) => char.isShow())
    const margin = this.dialog.ctx.width() - this.dialog.ctx.config.styles.margin * 2
    const spacing = 1 / (chars.length + 1)
    for (const [index, char] of chars.entries()) {
      char.element?.position.set(
        spacing * (index + 1) * margin + this.dialog.ctx.config.styles.margin,
        this.dialog.ctx.height()
      )
    }
    this.position = { type: type, order: chars.length }
  }

  public hide() {
    if (!this.element) return
    this.dialog.layer.remove(this.element)
    this.position = undefined
  }

  public async figure(figure: string) {
    this.figureAssets = figure
    const el = await loadAssets(this.figureAssets)
    el.anchor.set(0.5, 0.6)
    const isShow = this.isShow()
    const oldEl = this.element
    this.element = el
    if (this.element.height > 1677) {
      this.element.scale.set(1677 / this.element.height)
    }
    if (!isShow) return

    const index = this.dialog.layer.findIndex((el) => el === oldEl)
    if (!oldEl || index === -1) {
      this.hide()
      this.view()
      return
    }
    this.element?.position.set(oldEl.x, oldEl.y)
    this.dialog.layer.remove(oldEl)
    this.dialog.layer.addAt(this.element, index)
  }

  public display(name: string) {
    this.name = name
  }
}

export default Character
