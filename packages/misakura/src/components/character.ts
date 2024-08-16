import type { Sprite } from 'PIXI.JS'
import '@kotori-bot/core'
import loadAssets from '../utils/loadAssets'
import type DialogPage from '../pages/dialogPage'

export class Character {
  private readonly dialog: DialogPage

  public readonly identity: string

  private element?: Sprite

  public name: string

  public constructor(dialog: DialogPage, identity: string, name?: string) {
    this.dialog = dialog
    this.identity = identity
    this.name = name ?? identity
  }

  public isShow() {
    return this.element && this.dialog.layer.has(this.element)
  }

  public view(position: 'auto' | 'left' | 'center' | 'right' = 'auto') {
    if (!this.element) return

    this.dialog.layer.add(this.element)
    if (position !== 'auto') return
    const chars = Array.from(this.dialog.els.chars.values()).filter((char) => char.isShow())
    const margin = 1 - (this.dialog.ctx.config.styles.margin * 2) / this.dialog.ctx.width()
    const spacing = 1 / (chars.length + 1)
    const height = this.dialog.ctx.calcY(718)
    for (const [index, char] of chars.entries()) {
      char.element?.position.set(
        this.dialog.ctx.calcX(spacing * (index + 1), margin) + this.dialog.ctx.config.styles.margin,
        height
      )
    }
  }

  public hide() {
    if (this.element) this.dialog.layer.remove(this.element)
  }

  public async figure(figure: string) {
    const el = await loadAssets(figure)
    el.anchor.set(0.5, 0.5)
    el.scale.set(this.dialog.ctx.calcX(), this.dialog.ctx.calcY())
    const isShow = this.isShow()
    const oldEl = this.element
    this.element = el
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
