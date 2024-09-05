import { Application } from 'PIXI.JS'
import type Context from './core'
import { Layer } from '../class/layer'
import type { Page } from '../class/page'
import type { routes } from './routes'
import path from 'pathe'
import screen from 'screenfull'
import type { CoreOption } from '../types'

export class Controller {
  private readonly IS_PORTRAIT = window.innerHeight > window.innerWidth

  private readonly STANDARD_ASPECT = [1920, 1080]

  private readonly ctx: Context

  public readonly app = new Application()

  public readonly pages: Record<keyof typeof routes, Page> = {} as Controller['pages']

  public readonly layer = new Layer()

  private getAspect() {
    const targetRatio = this.STANDARD_ASPECT[0] / this.STANDARD_ASPECT[1]
    let width = window.innerWidth
    let height = window.innerHeight
    if (this.IS_PORTRAIT) [width, height] = [height, width]
    const currentRatio = width / height

    if (currentRatio > targetRatio) {
      width = height * targetRatio
    } else {
      height = width / targetRatio
    }
    if (this.IS_PORTRAIT) [width, height] = [height, width]
    return { width, height }
  }
  public constructor(ctx: Context) {
    this.ctx = ctx
    if (this.ctx.store.full()) {
      console.log('full')
      screen.toggle()
    }

    const { width, height } = this.getAspect()
    this.app = new Application({
      width,
      height,
      antialias: true,
      resolution: 1,
      ...(this.ctx.config.render ?? {})
    })
    if (this.IS_PORTRAIT) {
      this.app.stage.rotation = Math.PI / 2
      this.app.stage.position.x = width
      this.app.stage.scale.set(height / this.STANDARD_ASPECT[0], width / this.STANDARD_ASPECT[1])
    } else {
      this.app.stage.scale.set(width / this.STANDARD_ASPECT[0], height / this.STANDARD_ASPECT[1])
    }
    this.app.stage.addChild(...this.layer.combine())

    this.ctx.on('ready', () => {
      const renderTime = Date.now()
      window.addEventListener('resize', () => {
        if (renderTime && Date.now() - renderTime <= 300) return
        // setTimeout(() => {
        this.ctx.store.full(!!document.fullscreenElement)
        this.ctx.store.setLastPage(this.getCurrentPage())
        // window.location = '' as unknown as Location
        window.location.reload()
        // }, 2000)
      })

      this.listen('contextmenu', (event) => event.preventDefault())
      this.listen('keydown', (event) => {
        if (event.key === 'F5') event.preventDefault()
      })
      this.ctx.config.element.appendChild(this.app.view as unknown as Node)

      const lastPages = this.ctx.store.getLastPage()
      if (lastPages.length === 0) {
        this.pages.home.setActive()
        return
      }
      this.clear()
      for (const page of lastPages) this.pages[page as 'home'].setActive()
      this.ctx.store.setLastPage([])
    })
  }

  public getCurrentPage() {
    return Object.entries(this.pages)
      .filter(([, page]) => page.getActive())
      .map(([name]) => name)
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

  public width() {
    return this.STANDARD_ASPECT[0]
  }

  public height() {
    return this.STANDARD_ASPECT[1]
  }

  public path(type: keyof Required<CoreOption>['basedir'], ...paths: string[]) {
    const basedir = this.ctx.config.basedir[type]
    let handle = path.join(...paths)

    handle = handle.charAt(0) === '/' ? handle : path.join(basedir, handle)
    if (basedir === this.ctx.config.basedir.scripts) {
      if (path.basename(handle) === '') handle = path.join(handle, this.ctx.config.entry)
      else if (!['.mrs', '.txt'].includes(path.extname(handle))) handle += '.mrs'
    }

    return handle
  }
}

export default Controller
