import type { Context, EventsMapping } from '../app'
import type { LayerLevel } from '../types'
import { Layer } from './layer'

export abstract class Page {
  private isLoadOnce = false

  public abstract readonly level: LayerLevel

  public readonly layer = new Layer()

  public readonly ctx: Context

  public constructor(ctx: Context) {
    this.ctx = ctx
    this.init()
  }

  public abstract init(): void

  public loadOnce() {}

  public load() {}

  public dispose() {}

  public getActive() {
    return this.ctx.layer.has(this.layer)
  }

  public setActive(active = true) {
    if (active && !this.getActive()) {
      this.ctx.layer.add(this.layer, this.level)
      if (!this.isLoadOnce) {
        this.loadOnce()
        this.isLoadOnce = true
      }
      this.load()
      this.ctx.emit('page_active_change', this)
    } else if (!active && this.getActive()) {
      this.ctx.layer.remove(this.layer, this.level)
      this.dispose()
      this.ctx.emit('page_active_change', this)
    }
  }

  public reActive() {
    this.setActive(false)
    this.setActive()
  }

  public on<K extends keyof EventsMapping>(type: K, callback: EventsMapping[K]) {
    const newCallback = (...args: unknown[]) => {
      if (this.getActive()) (callback as (...args: unknown[]) => void)(...args)
    }
    this.ctx.on(type, newCallback)
    return () => this.ctx.off(type, newCallback)
  }

  public once<K extends keyof EventsMapping>(type: K, callback: EventsMapping[K]) {
    const newCallback = (...args: unknown[]) => {
      if (this.getActive()) return (callback as (...args: unknown[]) => void)(...args)
      this.once(type, callback)
    }
    this.ctx.once(type, newCallback)
    return () => this.ctx.off(type, newCallback)
  }

  public emit<K extends keyof EventsMapping>(type: K, ...args: Parameters<EventsMapping[K]>) {
    if (this.getActive()) this.ctx.emit(type, ...args)
  }

  public listen<K extends keyof HTMLElementEventMap>(
    type: K,
    callback: (event: HTMLElementEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
  ) {
    this.ctx.listen(
      type,
      (event) => {
        if (this.getActive()) callback(event)
      },
      options
    )
  }
}

export default Page
