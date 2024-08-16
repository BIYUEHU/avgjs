import { Sprite, Text, TextStyle } from 'PIXI.JS'
// import Character from '../utils/character'
import loadAssets from '../utils/loadAssets'
// import Command from '../utils/command'
// import Media from '../tools/media'
// import { Parser } from '../utils/parser'
// import Page from '../utils/page'
import { Page } from '../components'
import { type CharacterOption, LayerLevel } from '../types'
import Character from '../components/character'
import store from '../store'
import Parser from '../utils/parser'
import commander from '../utils/commander'

export class DialogPage extends Page {
  public readonly parser = new Parser()

  public readonly els = {
    bg: new Sprite(),
    msg: new Text(),
    name: new Text(),
    chars: new Map<string, Character>()
  }

  public readonly level = LayerLevel.MIDDLE

  public async init() {
    const s = this.ctx.config.styles
    this.character('unknown', { name: '???' })
    const dialog = await loadAssets(s.dialog, { width: this.ctx.width() })
    dialog.position.set(this.ctx.calcX(s.dialogX), this.ctx.calcY(s.dialogY))
    dialog.height = this.ctx.height() - dialog.y

    this.els.name.position.set(this.ctx.calcX(s.dialogNameX), this.ctx.calcY(s.dialogNameY))
    this.els.name.style = new TextStyle({
      fontSize: this.ctx.calcY(s.dialogNameSize)
    })
    this.els.msg.position.set(this.ctx.calcX(s.dialogMsgX), this.ctx.calcY(s.dialogMsgY))
    this.els.msg.style = new TextStyle({
      breakWords: true,
      wordWrap: true,
      wordWrapWidth: this.ctx.calcX(s.dialogMsgWrap),
      fontSize: this.ctx.calcY(s.dialogMsgSize)
    })
    this.ctx.layer.add([dialog, this.els.name, this.els.msg], LayerLevel.BEFORE)

    // Register commands
    commander(this)
  }

  private async nexthandle() {
    /* eslint-disable-next-line no-restricted-syntax */
    for await (const cmd of this.cmds.splice(State.index)) {
      await Command.run(...cmd)
      State.index! += 1
    }
  }

  public async run() {
    this.cmds = await loadScript(State.script)
    if (this.cmds.length <= State.index) throw new Error('script lines error')
    await this.nextHandle()
  }

  public async load() {
    const s = store.getState().dialog
    await this.background(s.background)
    for await (const cmd of Object.values(operation.chars)) {
      await this.parser.exec(cmd[0], cmd[1])
    }
    // await this.parser.exec()
    // if (!State.script) State.script = this.ctx.config.entry
    // await new Parser().run().catch((e) => logger.error(e))
  }

  public async background(assets: string) {
    if (this.els.bg) this.ctx.layer.remove(this.els.bg, LayerLevel.AFTER)
    for (const char of this.els.chars) char[1].hide()
    const el = await loadAssets(assets)
    el.width = this.ctx.width()
    el.height = this.ctx.height()
    this.ctx.layer.add(el)
    this.els.bg = el
  }

  public async character(identity: string, { name, show, figure }: CharacterOption) {
    let char = this.els.chars.get(identity)
    if (!char) {
      char = new Character(this, identity, name)
      this.els.chars.set(identity, char)
    } else if (name) {
      char.display(name)
    }
    if (show) char[show ? 'view' : 'hide']()
    if (figure) await char.figure(figure)
    return char
  }

  public pause(callback?: () => void, sleep?: number) {
    if (sleep !== undefined) {
      return new Promise<void>((resolve) => {
        const timer = setTimeout(() => {
          if (callback) callback()
          clearTimeout(timer)
          resolve(undefined)
        }, sleep * 1000)
      })
    }
    return new Promise<void>((resolve) => {
      this.ctx.once('next_dialog', () => {
        if (callback) callback()
        resolve(undefined)
      })
    })
  }

  // TODO: html tag supports
  public text(text: string, name = '') {
    let index = 0
    let timerId: number
    this.els.name.text = name
    this.els.msg.text = text[index]
    const timer = () => {
      timerId = setTimeout(() => {
        index += 1
        if (index >= text.length || text[index] === undefined) {
          clearTimeout(timerId)
          return
        }
        this.els.msg.text += text[index]
        timer()
      }, 30) as unknown as number
      this.ctx.once('resize', () => clearTimeout(timerId))
    }
    timer()
    return this.pause(() => clearTimeout(timerId))
  }
}

export default DialogPage
