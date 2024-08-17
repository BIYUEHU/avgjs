import { Application } from 'PIXI.JS'
import { TauriEvent, listen } from '@tauri-apps/api/event'
import getWindow from '../tools/getWindow'
import type Context from './core'
import { Layer } from '../components/layer'
import type { Page } from '../components/page'
import type { routes } from '../pages'

export class Controller {
  private readonly ctx: Context

  public readonly app: Application

  public pages: Record<keyof typeof routes, Page> = {} as Controller['pages']

  public layer = new Layer()

  public constructor(ctx: Context) {
    this.ctx = ctx
    this.app = new Application({ ...getWindow(), antialias: true, resolution: 1, ...(this.ctx.config.render ?? {}) })
    this.app.stage.addChild(...this.layer.combine())
    this.ctx.on('ready', () => {
      const renderTime = Date.now()
      listen(TauriEvent.WINDOW_RESIZED, () => {
        if (renderTime && Date.now() - renderTime <= 300) return
        window.location = '' as unknown as Location
      })

      this.listen('contextmenu', (event) => event.preventDefault())
      this.listen('keydown', (event) => {
        if (event.key === 'F5') event.preventDefault()
      })
      this.ctx.config.element.appendChild(this.app.view as unknown as Node)
    })
  }

  public listen<K extends keyof HTMLElementEventMap>(
    type: K,
    callback: (event: HTMLElementEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
  ) {
    this.ctx.config.element.addEventListener(type, (event) => callback(event), options)
  }

  public clear() {
    for (const page of Object.values(this.pages)) if (page.getActive()) page.setActive(false)
  }

  // public view() {
  // event.listen(TauriEvent.WINDOW_RESIZED, () => {
  //   if (this.renderTime && new Date().getTime() - this.renderTime <= 300) return
  //   this.ctx.emit('resize')
  //   const { width, height } = getWindow()
  //   this.app.renderer.resize(width, height)
  //   this.ctx.once('initialized', () => {
  //     this.renderTime = new Date().getTime()
  //   })
  //   // this.checkout().then(() => {
  //   //   this.renderTime = new Date().getTime()
  //   // })
  // })
  // element.addEventListener('click', () => {
  //   if (State.page === 'dialog') this.ctx.emit('next_dialog')
  // })
  // document.body.addEventListener('keydown', (event) => {
  //   switch (event.key) {
  //     case 'F5':
  //       event.preventDefault()
  //       break
  //     case 'Enter':
  //       if (State.page === 'dialog') this.ctx.emit('next_dialog')
  //       break
  //     case 'Control':
  //       break
  //     default:
  //   }
  // })
  // await loadFonts([
  //   ['Raleway', 'https://fonts.gstatic.font.im/s/raleway/v29/1Ptug8zYS_SKggPNyCAIT5lu.woff2'],
  //   [
  //     'Noto Sans JP',
  //     'https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.0.woff2',
  //   ],
  //   ['Orbitron', 'https://fonts.gstatic.font.im/s/orbitron/v31/yMJRMIlzdpvBhQQL_Qq7dy0.woff2'],
  // ]);
  // document.fonts.ready.then(() => this.checkout())
  // }

  public width() {
    return this.app.screen.width
  }

  public height() {
    return this.app.screen.height
  }

  public calcX(value = 1, rate = 1) {
    const origin = rate * this.width()
    if (value >= 1) return value * (origin / 1920)
    return value * origin
  }

  public calcY(value = 1, rate = 1) {
    const origin = rate * this.height()
    if (value >= 1) return value * (origin / 1080)
    return value * origin
  }
}

export default Controller
