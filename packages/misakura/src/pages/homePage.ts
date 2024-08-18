import { TextStyle, Text, Container } from 'PIXI.JS'
import { appWindow } from '@tauri-apps/api/window'
import loadAssets from '../utils/loadAssets'
import { Page } from '../class'
import { LayerLevel } from '../types'
import { getDialogScript, setDialogData } from '../store'
import { SpriteButton } from '../Ui/button/SpriteButton'

export class HomePage extends Page {
  public readonly level = LayerLevel.MIDDLE

  public async init() {
    const opts = { width: this.ctx.width(), height: this.ctx.height() }
    this.layer.add(
      [await loadAssets('/gui/home/background.png', opts), await loadAssets('/gui/home/foreground.png', opts)],
      LayerLevel.AFTER
    )
    /* title */
    const title = new Text(
      '視覚小説ゲームテスト',
      new TextStyle({
        fontFamily: 'Noto Sans JP',
        fontSize: 100,
        fill: 0x00fff0
      })
    )
    const subtitle = new Text(
      'Visual novel game demonstration',
      new TextStyle({
        fontFamily: 'Raleway',
        fontSize: 50,
        fill: 0x00ccc0
      })
    )
    title.anchor.set(1, 0)
    subtitle.anchor.set(1, 0)
    title.position.set(1880, 50)
    subtitle.position.set(1790, 160)

    /* buttons */
    const btnOptions = {
      style: {
        fontSize: 43
      }
    }

    const startButton = new SpriteButton(
      'START',
      (type) => {
        if (type !== 'onPress') return
        this.ctx.clear()
        setDialogData({ entry: this.ctx.config.entry, line: 0 })
        this.ctx.pages.dialog.setActive()
      },
      btnOptions
    )
    startButton.view.position.y = 220

    const continueButton = new SpriteButton(
      'CONTINUE',
      (type) => {
        if (type !== 'onPress' || !getDialogScript()) return
        this.ctx.clear()
        this.ctx.pages.dialog.setActive()
      },
      btnOptions
    )
    continueButton.view.position.y = 280

    const loadButton = new SpriteButton(
      'LOAD',
      (type) => {
        if (type !== 'onPress' || !getDialogScript()) return
        this.ctx.clear()
        this.ctx.pages.dialog.setActive()
      },
      btnOptions
    )
    loadButton.view.position.y = 340

    const extraButton = new SpriteButton(
      'EXTRA',
      (type) => {
        if (type !== 'onPress') return
      },
      btnOptions
    )
    extraButton.view.position.y = 400

    const configButton = new SpriteButton(
      'CONFIG',
      (type) => {
        if (type !== 'onPress') return
      },
      btnOptions
    )
    configButton.view.position.y = 460

    const aboutButton = new SpriteButton(
      'ABOUT',
      (type) => {
        if (type !== 'onPress') return
      },
      btnOptions
    )
    aboutButton.view.position.y = 520

    const exitButton = new SpriteButton(
      'EXIT',
      (type) => {
        if (type !== 'onPress') return
        this.ctx.clear()
        appWindow.close()
      },
      btnOptions
    )
    exitButton.view.position.y = 580

    const buttonContainer = new Container()
    buttonContainer.position.set(120)

    buttonContainer.addChild(
      startButton.view,
      continueButton.view,
      loadButton.view,
      extraButton.view,
      configButton.view,
      aboutButton.view,
      exitButton.view
    )
    this.layer.add(buttonContainer)
    /* bottom information */
    const style2 = new TextStyle({
      fontFamily: 'Raleway',
      fontSize: 40,
      fill: 0x00b4ff
    })
    const version = new Text('v0.1.0', style2)
    const copyright = new Text('© 2024 Hotaru', style2)
    version.anchor.set(1, 1)
    copyright.anchor.set(1, 1)
    version.position.set(1910, 1020)
    copyright.position.set(1910, 1070)
    this.layer.add([version, copyright, title, subtitle], LayerLevel.BEFORE)
  }
}

export default HomePage
