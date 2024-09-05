import { Text, HTMLText, Sprite, Graphics } from 'pixi.js'
import { loadAssets } from '../Ui/utils/loader'
import { Page } from '../class'
import { type CharacterOption, LayerLevel } from '../types'
import Character from '../class/character'
import Parser from '../utils/parser'
import commander from '../utils/commander'
import { logger } from '../tools/logger'
import { SpriteButton } from '../Ui/button/SpriteButton'
import { createAutoLayout } from '../Ui/utils/layout'
import { loadScript, loadScriptPart, loadText } from '../tools/loadFile'
import { interval, nextTick, timeout } from '../tools/nextTick'

export class DialogPage extends Page {
  private lastPressNextDialogTime = 0

  private clickLock = false

  private autoMode = false

  public currentPromise?: Promise<unknown>

  public setClickLock = () => {
    this.clickLock = true
    nextTick(() => {
      this.clickLock = false
    })
  }

  public readonly parser = new Parser()

  public readonly els = {
    bg: new Sprite(),
    msg: new HTMLText(),
    speaker: new HTMLText(),
    chars: new Map<string, Character>(),
    bgm: '',
    msgParts: [] as string[][],
    voiceParts: [] as string[][]
  }

  public readonly level = LayerLevel.MIDDLE

  public async init() {
    const s = this.ctx.config.styles
    const dialogView = await loadAssets(s.dialog, { width: this.ctx.width() })
    dialogView.anchor.set(0.5, 1)
    dialogView.position.set(this.ctx.width() / 2, this.ctx.height())

    this.els.speaker.position.set(s.dialogNameX, s.dialogNameY)
    this.els.speaker.style = { fontSize: s.dialogNameSize }
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

    const buttonLayout = createAutoLayout(
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
        [
          'auto',
          () => {
            this.autoMode = !this.autoMode
            logger.info(`Auto mode ${this.autoMode ? 'on' : 'off'}`)
            if (this.autoMode) this.ctx.emit('next_dialog')
          }
        ],
        [
          'config',
          () => {
            this.ctx.pages.config.setActive()
          }
        ]
      ] as const,
      {
        pos: [1135, 1040],
        direction: 'right',
        spacing: 85
      },
      ([name, callback]) => {
        const button = new SpriteButton(
          '',
          (type) => {
            this.setClickLock()
            if (type !== 'onPress') return
            callback()
          },
          {
            button: `/gui/dialog/buttons/${name}.png`,
            hoverButton: `/gui/dialog/buttons/${name}Hover.png`,
            pressedButton: `/gui/dialog/buttons/${name}Hover.png`
          }
        )
        button.view.scale.set(0.45, 0.45)
        return button.view
      }
    )
    this.layer.add(buttonLayout, LayerLevel.BEFORE)

    const fullButton = new SpriteButton(
      '',
      (type) => {
        this.setClickLock()
        if (type !== 'onPress') return
        if (!document.fullscreenElement) {
          // if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen()
          /*}  else if (document.documentElement.mozRequestFullScreen) { // Firefox
            document.documentElement.mozRequestFullScreen();
          } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari and Opera
            document.documentElement.webkitRequestFullscreen();
          } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
            document.documentElement.msRequestFullscreen();
          } */
        } else {
          // if (document.exitFullscreen) {
          document.exitFullscreen()
          /* } else if (document.mozCancelFullScreen) { // Firefox
            document.mozCancelFullScreen();
          } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
            document.webkitExitFullscreen();
          } else if (document.msExitFullscreen) { // IE/Edge
            document.msExitFullscreen();
          } */
        }
      },
      {
        button: '/gui/dialog/buttons/full.png',
        hoverButton: '/gui/dialog/buttons/fullHover.png',
        pressedButton: '/gui/dialog/buttons/fullHover.png'
      }
    )
    fullButton.view.position.set(50, 50)
    fullButton.view.scale.set(0.5, 0.5)
    // this.layer.add(fullButton.view, LayerLevel.BEFORE)

    // Register commands
    commander(this)

    // Register events
    const nextDialogEmiter = (force = false) => {
      const currentTime = Date.now()
      if (currentTime - this.lastPressNextDialogTime > (force ? 200 : 600)) {
        this.lastPressNextDialogTime = currentTime
        this.ctx.emit('next_dialog')
      }
    }
    this.listen('keydown', (event) => {
      if (['Enter', 'ArrowDown', 'ArrowRight'].includes(event.key)) {
        nextDialogEmiter()
        return
      }
      switch (event.key) {
        case 'Escape':
          if (!this.ctx.pages.pause.getActive()) this.ctx.pages.pause.setActive(true, false)
          break
        case 'Control':
          nextDialogEmiter(true)
          break
        default:
      }
    })

    this.listen('click', () => {
      if (!this.clickLock && this.getActive(true)) nextDialogEmiter()
    })
  }

  public async load() {
    if (!this.ctx.store.getHistoryPage().includes('dialog')) this.ctx.store.clearHistoryPage()

    // Load store data to view
    await this.background(this.ctx.store.getDialogBackground())
    if (!this.ctx.store.getHistoryPage().includes('dialog')) {
      this.music(this.ctx.store.getDialogMusic().name, this.ctx.store.getDialogMusic().seconds)
    }
    this.els.speaker.text = this.ctx.store.getDialogSpeaker()
    const shownCharacters = (
      await Promise.all(
        this.ctx.store
          .getDialogCharacters()
          .map(async (charData) => [charData, await this.character(charData.identity, charData)])
      )
    ).filter(([charData]) => charData.position)

    const autoShownCharacters = shownCharacters
      .filter(([charData]) => charData.position?.type === 'auto')
      .sort(([a], [b]) => (a.position?.order as number) - (b.position?.order as number))
    for (const [, char] of autoShownCharacters) (char as Character).view()

    // Load script
    const isFinish = await this.apply(this.ctx.store.getDialogScript())
    if (isFinish) {
      await this.pause(undefined, 1)
      this.ctx.store.setDialogScript({ entry: '', line: 0 })
      this.ctx.store.clearHistoryPage()
      this.ctx.pages.home.setActive()
    }
  }

  public async apply(name: string) {
    // Set stop signal
    let shouldBreak = false
    const breakListener = (page: Page) => {
      if (page !== this || page.getActive()) return
      shouldBreak = true
    }
    this.ctx.on('page_active_change', breakListener)
    let disposeTimer: (() => void) | undefined
    const breakPromise = new Promise<void>((resolve) => {
      disposeTimer = interval(() => {
        if (!shouldBreak) return
        resolve()
      }, 100)
    })
    const dispose = () => {
      this.ctx.off('page_active_change', breakListener)
      disposeTimer?.()
    }

    // Load and execute scripts
    const scriptFile = this.ctx.path('scripts', name)
    const scriptTemp = await loadScript(scriptFile)

    if (!scriptTemp || this.ctx.store.getDialogLine() === scriptTemp.length) {
      logger.warn('Script error: empty or not found')
      dispose()
      return !shouldBreak
    }

    this.els.msgParts = (await loadScriptPart(scriptFile)) ?? []
    if (this.els.msgParts.length === 0) logger.warn('Script dialog message content be empty or not found')

    this.els.voiceParts = (await loadScriptPart(scriptFile, 'voice')) ?? []
    if (this.els.voiceParts.length === 0) logger.warn('Script dialog message voice be empty or not found')

    // Pre handle 'read' command
    const script: string[] = []
    if (this.els.msgParts.length === this.els.voiceParts.length) {
      let readCount = 0

      for (const item of scriptTemp) {
        if (item !== 'read') {
          script.push(item)
          continue
        }
        if (readCount >= this.els.msgParts.length || this.els.msgParts[readCount].length === 0) {
          logger.warn(`Script pre handle failed: no content found for 'read' at position ${readCount}`)
          break
        }
        for (const [index, item] of this.els.msgParts[readCount].entries()) {
          const voice = this.els.voiceParts[readCount][index]
          if (voice.length > 1) script.push(`voice ${JSON.stringify(voice)}`)
          script.push(item)
        }
        readCount += 1
      }
    } else {
      script.push(...scriptTemp)
      logger.warn('Script pre handle failed: dialog message content and voice length not match')
    }

    if (this.ctx.store.getDialogLine() > script.length) {
      logger.error('Script error: running line to bigger')
      dispose()
      return !shouldBreak
    }

    let lastPromise: Promise<unknown> | undefined
    const notNewPromise = () => !lastPromise || lastPromise === this.currentPromise

    while (this.ctx.store.getDialogLine() < script.length) {
      if (shouldBreak) break
      const line = this.ctx.store.getDialogLine()
      try {
        if (notNewPromise()) this.parser.exec(script[line])
        lastPromise = this.currentPromise
        await Promise.race([this.currentPromise, breakPromise])
      } catch (e) {
        logger.error(`Script error at ${scriptFile} line ${line}:`, e instanceof Error ? e.message : e?.toString() ?? e)
      }
      if (notNewPromise()) this.ctx.store.nextDialogLine()
    }

    dispose()
    const line = this.ctx.store.getDialogLine()
    if (line) this.ctx.store.setDialogLine(line - 1)
    return !shouldBreak
  }

  // TODO: modify by `import()`
  public async call(name: string) {
    const text = await loadText(this.ctx.path('scripts', name))
    if (!text) {
      logger.error(`Javascript file ${name} not found`)
      return
    }

    try {
      // biome-ignore lint:
      const result = eval(text)
      logger.info(`Javascript file ${name} call result:`, result)
    } catch (e) {
      logger.error(`Javascript file ${name} call failed`, e)
    }
  }

  public dispose() {
    this.lastPressNextDialogTime = 0
    for (const [identity, char] of this.els.chars) {
      char.hide()
      this.els.chars.delete(identity)
    }
  }

  public async background(assets: string) {
    this.ctx.store.setDialogBackground(assets)

    if (this.els.bg) this.layer.remove(this.els.bg, LayerLevel.AFTER)
    for (const char of this.els.chars) char[1].hide()
    const el = await loadAssets(this.ctx.path('background', assets))
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
    if (figure && figure !== 'undefined') await char.figure(this.ctx.path('figure', figure))
    logger.info('figure', figure, typeof figure)
    this.ctx.store.setDialogCharacters(...Array.from(this.els.chars.values()))

    return char
  }

  public pause(callback?: () => void, sleep?: number) {
    if (sleep !== undefined) {
      return new Promise<void>((resolve) => {
        timeout(() => {
          if (callback) callback()
          resolve()
        }, sleep * 1000)
      })
    }

    return new Promise<void>((resolve) => {
      this.once('next_dialog', () => {
        if (!this.getActive(true)) return
        if (callback) callback()
        resolve()
      })
    })
  }

  public text(text: string, name = '') {
    this.ctx.store.setDialogSpeaker(name)

    let index = 0
    let tempText = ''
    const dispose: (() => void)[] = []
    this.els.speaker.text = name
    this.els.msg.text = text[index]

    const timer = () => {
      dispose.push(
        timeout(
          () => {
            index += 1
            if (index >= text.length || text[index] === undefined) {
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
        )
      )
      this.ctx.once('resize', () => dispose.map((dispose) => dispose()))
    }
    timer()
    const nextClick = this.pause(() => dispose.map((dispose) => dispose()))
    if (!this.autoMode) return nextClick
    return Promise.race<void>([
      nextClick,
      new Promise((resolve) =>
        timeout(() => {
          if (this.autoMode) resolve()
        }, text.length * 165)
      )
    ])
  }

  public music(name?: string, seconds = 0) {
    if (!name) {
      this.ctx.media.stopAll()
      this.els.bgm = ''
      this.ctx.store.setDialogMusic()
      return
    }
    this.ctx.media.stopAll()
    this.els.bgm = name
    const sound = this.ctx.media.music(name, seconds)
    this.ctx.store.setDialogMusic(name, seconds)
    const timerIntervalSeconds = 0.5
    const dispose = interval(() => {
      if (this.els.bgm !== name || this.ctx.pages.home.getActive()) {
        this.ctx.media.stop(name)
        dispose()
        return
      }
      this.ctx.store.setDialogMusic(name, sound.seek())
    }, timerIntervalSeconds * 1000)
  }

  public options(name: string, ...text: string[]) {
    return new Promise<void>((resolve) => {
      const layout = createAutoLayout(
        text,
        {
          pos: [this.ctx.width() / 2, this.ctx.height() / 2],
          direction: 'column',
          spacing: 40
        },
        (text, index) =>
          new SpriteButton(
            text,
            (type) => {
              if (type !== 'onPress') return
              this.parser.exec(`let ${JSON.stringify(name)} ${index}`)
              this.layer.remove(layout, LayerLevel.BEFORE)
              nextTick(() => resolve())
            },
            {
              style: { fontSize: 30 },
              button: '/gui/dialog/option.png',
              hoverButton: '/gui/dialog/optionHover.png',
              pressedButton: '/gui/dialog/optionHover.png'
            }
          ).view
      )
      if (!this.layer.has(layout, LayerLevel.BEFORE)) this.layer.add(layout, LayerLevel.BEFORE)
      const dispose = (page: Page) => {
        if (this === page && !this.getActive()) this.layer.remove(layout, LayerLevel.BEFORE)
        if (!this.layer.has(layout, LayerLevel.BEFORE)) this.ctx.off('page_active_change', dispose)
      }
      this.ctx.on('page_active_change', dispose)
    })
  }

  public input(name: string, _submit: string) {
    // let inputData = ''
    return new Promise<void>((resolve) => {
      let result = ''
      while (!result.trim()) {
        result = prompt() ?? ''
      }
      this.parser.exec(`let ${JSON.stringify(name)} ${JSON.stringify(result.replaceAll(' ', ''))}`)
      nextTick(() => resolve())
      /* shit from Pixi Ui */
      /*       const layout = createAutoLayout(
        ['', ''],
        {
          pos: [this.ctx.width() / 2, this.ctx.height() / 2],
          direction: 'column',
          spacing: 40
        },
        (_, index) => {
          if (index === 0) {
            const input = new Input({
              bg: '/gui/dialog/input.png'
            })
            input.onChange.connect((value) => {
              inputData = value
            })
            return input
          }
          return new SpriteButton(
            submit,
            (type) => {
              if (type !== 'onPress') return
              this.parser.exec(`let ${JSON.stringify(name)} ${inputData}`)
              this.layer.remove(layout, LayerLevel.BEFORE)
              nextTick(() => resolve())
            },
            {
              style: { fontSize: 30 },
              button: '/gui/dialog/option.png',
              hoverButton: '/gui/dialog/optionHover.png',
              pressedButton: '/gui/dialog/optionHover.png'
            }
          ).view
        }
      )
      if (!this.layer.has(layout, LayerLevel.BEFORE)) this.layer.add(layout, LayerLevel.BEFORE)
      const dispose = (page: Page) => {
        if (this === page && !this.getActive()) this.layer.remove(layout, LayerLevel.BEFORE)
        if (!this.layer.has(layout, LayerLevel.BEFORE)) this.ctx.off('page_active_change', dispose)
      }
      this.ctx.on('page_active_change', dispose) */
    })
  }

  public title(text: string, seconds = 0, textColor = '#fff', bgColor = '#333') {
    const background = new Graphics()
    background.beginFill(bgColor)
    background.drawRect(0, 0, this.ctx.width(), this.ctx.height())
    background.endFill()
    const title = new Text(text, {
      breakWords: true,
      wordWrap: true,
      fontSize: 65,
      wordWrapWidth: this.ctx.width() * 0.8,
      fill: textColor,
      align: 'center'
    })
    title.anchor.set(0.5, 0.5)
    title.position.set(this.ctx.width() / 2, this.ctx.height() / 2)

    this.layer.add(background, LayerLevel.BEFORE)
    this.layer.add(title, LayerLevel.BEFORE)
    return this.pause(() => {
      this.layer.remove(background, LayerLevel.BEFORE)
      this.layer.remove(title, LayerLevel.BEFORE)
    }, seconds || undefined)
  }
}

export default DialogPage
