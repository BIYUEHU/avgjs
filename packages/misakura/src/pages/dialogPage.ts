import { HTMLText, Sprite } from 'PIXI.JS'
import loadAssets from '../utils/loadAssets'
import { Page } from '../class'
import { type CharacterOption, LayerLevel } from '../types'
import Character from '../class/character'
import {
  clearHistoryPage,
  getDialogBackground,
  getDialogCharacters,
  getDialogLine,
  getDialogMusic,
  getDialogScript,
  getDialogSpeaker,
  nextDialogLine,
  setDialogBackground,
  setDialogCharacters,
  setDialogData,
  setDialogLine,
  setDialogMusic,
  setDialogSpeaker
} from '../store'
import Parser from '../utils/parser'
import commander from '../utils/commander'
import loadScript from '../utils/loadScript'
import { logger } from '../tools/logger'
import { SpriteButton } from '../Ui/button/SpriteButton'
import { createLayout } from '../Ui/utils/layout'
import { Sound, sound } from '@pixi/sound'

export class DialogPage extends Page {
  private lastPressNextDialogTime = 0

  public currentPromise?: Promise<unknown>

  public readonly parser = new Parser()

  public readonly els = {
    bg: new Sprite(),
    msg: new HTMLText(),
    speaker: new HTMLText(),
    chars: new Map<string, Character>(),
    bgm: ''
  }

  public readonly level = LayerLevel.MIDDLE

  public async init() {
    const s = this.ctx.config.styles
    const dialogView = await loadAssets(s.dialog, { width: this.ctx.width() })
    dialogView.anchor.set(0.5, 1)
    dialogView.position.set(this.ctx.width() / 2, this.ctx.height())

    this.els.speaker.position.set(s.dialogNameX, s.dialogNameY)
    this.els.speaker.style = {
      fontSize: s.dialogNameSize
    }
    this.els.msg.position.set(s.dialogMsgX, s.dialogMsgY)
    this.els.msg.style = {
      breakWords: true,
      wordWrap: true,
      wordWrapWidth: s.dialogMsgWrap,
      fontSize: s.dialogMsgSize
    }
    this.layer.add(dialogView, LayerLevel.BEFORE)
    this.layer.add(this.els.speaker, LayerLevel.BEFORE)
    this.layer.add(this.els.msg, LayerLevel.BEFORE)

    let clickLock = false
    const setClickLock = () => {
      clickLock = true
      const timer = setTimeout(() => {
        clickLock = false
        clearTimeout(timer)
      })
    }

    const buttonLayout = createLayout(
      [
        [
          'load',
          () => {
            this.ctx.pages.load.setActive()
          }
        ],
        [
          'save',
          () => {
            this.ctx.pages.save.setActive()
          }
        ],
        ['quickLoad', () => {}],
        ['quickSave', () => {}],
        ['log', () => {}],
        ['skip', () => {}],
        ['auto', () => {}],
        [
          'config',
          () => {
            this.ctx.pages.config.setActive()
          }
        ]
      ] as const,
      ([name, callback], index) => {
        const button = new SpriteButton(
          '',
          (type) => {
            if (type !== 'onPress') return
            setClickLock()
            callback()
          },
          { button: `/gui/dialog/buttons/${name}.png` }
        )
        button.view.position.set(1150 + index * 63, 1055)
        button.view.scale.set(0.38, 0.38)
        return button.view
      }
    )
    this.layer.add(buttonLayout, LayerLevel.BEFORE)

    // Register commands
    commander(this)

    // Register events
    const nextDialogEmiter = (force = false) => {
      const currentTime = Date.now()
      if (currentTime - this.lastPressNextDialogTime > (force ? 200 : 600)) {
        this.lastPressNextDialogTime = currentTime
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
          this.ctx.pages.home.setActive()
          break
        case 'Shift':
          setDialogData({ entry: this.ctx.config.entry, line: 0 })
          this.reActive()
          break
        case 'Control':
          nextDialogEmiter(true)
          break
        default:
      }
    })

    this.listen('click', () => {
      if (!clickLock || this.getActive(true)) nextDialogEmiter()
    })
  }

  public async load() {
    clearHistoryPage()

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
    this.music(getDialogMusic().name, getDialogMusic().seconds)
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
        resolve(undefined)
      })
    })
  }

  public text(text: string, name = '') {
    setDialogSpeaker(name)

    let index = 0
    let timerId: number
    let tempText = ''
    this.els.speaker.text = name
    this.els.msg.text = text[index]

    const timer = () => {
      timerId = setTimeout(
        () => {
          index += 1
          if (index >= text.length || text[index] === undefined) {
            clearTimeout(timerId)
            if (tempText) {
              this.els.msg.text += tempText
              tempText = ''
            }
            return
          }
          if (text[index] === '<') {
            if (tempText) this.els.msg.text += tempText
            tempText = '<'
          } else if (text[index] === '>') {
            this.els.msg.text += `${tempText ?? ''}>`
            tempText = ''
          } else {
            if (tempText) tempText += text[index]
            else this.els.msg.text += text[index]
          }
          timer()
        },
        tempText ? 0 : 30
      ) as unknown as number
      this.ctx.once('resize', () => clearTimeout(timerId))
    }
    timer()
    return this.pause(() => clearTimeout(timerId))
  }

  public music(name?: string, seconds = 0) {
    if (!name) {
      sound.stopAll()
      this.els.bgm = ''
      setDialogMusic()
      return
    }
    this.els.bgm = name
    const song = Sound.from(name)
    // setDialogMusic(name, )

    logger.info(`Play music ${name} for ${1} seconds`, sound)
    song.play({ loop: true /* , volume: 0.5 */, start: seconds })
  }
}

export default DialogPage
