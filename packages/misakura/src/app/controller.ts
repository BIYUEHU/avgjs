import { Application } from 'PIXI.JS'
// import { event } from '@tauri-apps/api'
// import { TauriEvent } from '@tauri-apps/api/event'
import getWindow from '../tools/getWindow'
// import { State } from '../tools/state'
import type Context from './core'
import { Layer } from '../components/layer'
import type { Page } from '../components/page'
import type { routes } from '../pages'
// import { loadFonts } from '../tools/loadFont';

declare module 'fluoro' {
  interface Context {}
}

export class Controller {
  private readonly ctx: Context

  public readonly app: Application

  public pages: Record<keyof typeof routes, Page> = {} as Controller['pages']

  public layer = new Layer()

  // private renderTime?: number

  public constructor(ctx: Context) {
    this.ctx = ctx
    this.app = new Application({ ...getWindow(), antialias: true, resolution: 1, ...(this.ctx.config.render ?? {}) })
    this.app.stage.addChild(...this.layer.combine())
    this.ctx.on('ready', () => {
      this.ctx.config.element.appendChild(this.app.view as unknown as Node)
    })
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
  // document.body.addEventListener('contextmenu', (event) => event.preventDefault())
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
