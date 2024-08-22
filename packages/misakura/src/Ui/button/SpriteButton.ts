import { isMobile, Container, Sprite, Text, Texture, type ITextStyle } from 'PIXI.JS'
import { Button } from '@pixi/ui'
import defu from 'defu'
import { preload } from '../utils/loader'
import { nextTick } from '../../tools/nextTick'

type ActionType = 'down' | 'up' | 'upOut' | 'out' | 'onPress' | 'hover'

interface SpriteButtonOptions {
  style: Partial<ITextStyle>
  hoverStyle: Partial<ITextStyle>
  pressedStyle: Partial<ITextStyle>
  button: string
  hoverButton: string
  pressedButton: string
}

const DEFAULT_OPTIONS: Partial<SpriteButtonOptions> = {
  style: { fill: 0x999 },
  hoverStyle: { fill: 0xccc },
  pressedStyle: { fill: 0xeee }
}

export class SpriteButton extends Button {
  private readonly action: (type: ActionType) => void

  private readonly options: Partial<SpriteButtonOptions>

  public readonly textView: Text

  public readonly buttonBg = new Sprite()

  public constructor(text: string, action: (type: ActionType) => void, options?: Partial<SpriteButtonOptions>) {
    super(new Container())
    this.action = action
    this.options = defu(options, DEFAULT_OPTIONS)
    this.textView = new Text(text, this.options.style)

    if (text) this.view.addChild(this.textView)
    // this.view = this.textView

    preload(
      [options?.button, options?.hoverButton, options?.pressedButton].filter((el) => el !== undefined) as string[]
    ).then(() => {
      if (typeof this.options.button !== 'string') return
      // this.textView.y = -10
      this.textView.anchor.set(0.5)
      this.buttonBg.texture = Texture.from(this.options.button)
      this.buttonBg.anchor.set(0.5)
      this.view.removeChild(this.textView)
      this.view.addChild(this.buttonBg, this.textView)
    })
  }

  public override down() {
    if (this.options.pressedButton) this.buttonBg.texture = Texture.from(this.options.pressedButton)
    this.textView.style = { ...this.textView.style, ...this.options.pressedStyle }
    this.action('down')
  }

  public override up() {
    if (isMobile.any) {
      if (this.options.button) this.buttonBg.texture = Texture.from(this.options.button)
      this.textView.style = { ...this.textView.style, ...this.options.style }
    } else {
      if (this.options.hoverButton) this.buttonBg.texture = Texture.from(this.options.hoverButton)
      this.textView.style = { ...this.textView.style, ...this.options.hoverStyle }
    }
    this.action('up')
  }

  public override upOut() {
    if (this.options.button) this.buttonBg.texture = Texture.from(this.options.button)
    this.textView.style = { ...this.textView.style, ...this.options.style }
    this.action('upOut')
  }

  public override out() {
    if (!this.isDown) {
      if (this.options.button) this.buttonBg.texture = Texture.from(this.options.button)
      this.textView.style = { ...this.textView.style, ...this.options.style }
    }
    this.action('out')
  }

  public override press() {
    this.action('onPress')
    nextTick(() => {
      if (this.options.button) this.buttonBg.texture = Texture.from(this.options.button)
      this.textView.style = { ...this.textView.style, ...this.options.style }
    })
  }

  public override hover() {
    if (!this.isDown) {
      if (this.options.hoverButton) this.buttonBg.texture = Texture.from(this.options.hoverButton)
      this.textView.style = { ...this.textView.style, ...this.options.hoverStyle }
    }
    this.action('hover')
  }
}
