import { Sprite, Text, TextStyle } from 'PIXI.JS'
import loadAssets from '../utils/loadAssets'
import { Page } from '../class'
import { type CharacterOption, LayerLevel } from '../types'
import Character from '../class/character'
import {
  getDialogBackground,
  getDialogCharacters,
  getDialogLine,
  getDialogScript,
  getDialogSpeaker,
  nextDialogLine,
  setDialogBackground,
  setDialogCharacters,
  setDialogData,
  setDialogLine,
  setDialogSpeaker
} from '../store'
import Parser from '../utils/parser'
import commander from '../utils/commander'
import loadScript from '../utils/loadScript'
import { logger } from '../tools/logger'

export class DialogPage extends Page {
  private lastPressNextDialogTime = 0

  public currentPromise?: Promise<unknown>

  public readonly parser = new Parser()

  public readonly els = {
    bg: new Sprite(),
    msg: new Text(),
    speaker: new Text(),
    chars: new Map<string, Character>()
  }

  public readonly level = LayerLevel.MIDDLE

  public async init() {
    this.character('unknown', { name: '???' })

    const s = this.ctx.config.styles
    const dialog = await loadAssets(s.dialog, { width: this.ctx.width() })
    dialog.position.set(this.ctx.calcX(s.dialogX), this.ctx.calcY(s.dialogY))
    dialog.height = this.ctx.height() - dialog.y

    this.els.speaker.position.set(this.ctx.calcX(s.dialogNameX), this.ctx.calcY(s.dialogNameY))
    this.els.speaker.style = new TextStyle({
      fontSize: this.ctx.calcY(s.dialogNameSize)
    })
    this.els.msg.position.set(this.ctx.calcX(s.dialogMsgX), this.ctx.calcY(s.dialogMsgY))
    this.els.msg.style = new TextStyle({
      breakWords: true,
      wordWrap: true,
      wordWrapWidth: this.ctx.calcX(s.dialogMsgWrap),
      fontSize: this.ctx.calcY(s.dialogMsgSize)
    })
    this.layer.add(dialog, LayerLevel.BEFORE)
    this.layer.add(this.els.speaker, LayerLevel.BEFORE)
    this.layer.add(this.els.msg, LayerLevel.BEFORE)

    // Register commands
    commander(this)

    // Register events
    const nextDialogEmiter = () => {
      const currentTime = Date.now()
      if (currentTime - this.lastPressNextDialogTime > 1050) {
        this.lastPressNextDialogTime = currentTime
        logger.info('emiter: ', this.getActive())
        this.emit('next_dialog')
      }
    }
    this.listen('keydown', (event) => {
      if (['Enter', 'ArrowDown', 'ArrowRight'].includes(event.key)) {
        nextDialogEmiter()
        return
      }
      switch (event.key) {
        case 'Escape':
          this.ctx.clear()
          this.ctx.pages.home.setActive()
          break
        case 'Shift':
          setDialogData({ entry: this.ctx.config.entry, line: 0 })
          this.reActive()
          break
        case 'Control':
          break
        default:
      }
    })

    this.listen('click', () => {
      nextDialogEmiter()
    })
  }

  public async load() {
    // Set stop signal
    let shouldBreak = false
    const breakListener = (page: Page) => {
      if (page !== this || page.getActive()) return
      shouldBreak = true
    }

    this.ctx.on('page_active_change', breakListener)
    let timerId: number
    const breakPromise = new Promise((resolve) => {
      timerId = Number(
        setInterval(() => {
          if (!shouldBreak) return
          clearInterval(timerId)
          resolve(undefined)
        }, 100)
      )
    })
    const dispose = () => {
      this.ctx.off('page_active_change', breakListener)
      clearInterval(timerId)
    }

    // Load store data to view
    await this.background(getDialogBackground())
    this.els.speaker.text = getDialogSpeaker()
    const shownCharacters = (
      (await Promise.race([
        Promise.all(
          getDialogCharacters().map(async (charData) => [charData, await this.character(charData.identity, charData)])
        ),
        breakPromise
      ])) as [ReturnType<typeof getDialogCharacters>[0], Character][] | undefined
    )?.filter(([charData]) => charData.position)
    if (!shownCharacters) return dispose()

    const autoShownCharacters = shownCharacters
      .filter(([charData]) => charData.position?.type === 'auto')
      .sort(([a], [b]) => (a.position?.order as number) - (b.position?.order as number))
    for (const [, char] of autoShownCharacters) (char as Character).view('auto')

    // Load and execute scripts
    const script = (await Promise.race([loadScript(getDialogScript()), breakPromise])) as string[] | undefined
    if (!script || getDialogLine() === script.length) return dispose()
    if (getDialogLine() > script.length) {
      logger.error('Script error: running line to bigger')
      return dispose()
    }

    while (getDialogLine() < script.length) {
      if (shouldBreak) break
      const line = getDialogLine()
      try {
        this.parser.exec(script[line])
        await Promise.race([this.currentPromise, breakPromise])
        logger.info(`Script exec at ${getDialogScript()} line ${line}`)
      } catch (e) {
        logger.error(`Script error at ${getDialogScript()} line ${line}:`, e)
      }
      nextDialogLine()
    }

    dispose()
    const line = getDialogLine()
    if (line) setDialogLine(line - 1)
  }

  public dispose() {
    this.lastPressNextDialogTime = 0
    for (const [identity, char] of this.els.chars) {
      char.hide()
      this.els.chars.delete(identity)
    }
  }

  public async background(assets: string) {
    setDialogBackground(assets)

    if (this.els.bg) this.layer.remove(this.els.bg, LayerLevel.AFTER)
    for (const char of this.els.chars) char[1].hide()
    const el = await loadAssets(assets)
    el.width = this.ctx.width()
    el.height = this.ctx.height()
    this.layer.add(el, LayerLevel.AFTER)
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
    setDialogCharacters(...Array.from(this.els.chars.values()))

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
      this.once('next_dialog', () => {
        if (callback) callback()
        logger.record(getDialogCharacters())
        resolve(undefined)
      })
    })
  }

  // TODO: html tag supports
  public text(text: string, name = '') {
    setDialogSpeaker(name)

    let index = 0
    let timerId: number
    this.els.speaker.text = name
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
