import type { Context, EventsMapping } from '../app'
import type { LayerLevel } from '../types'
import { Layer } from './layer'

export abstract class Page {
  public abstract readonly level: LayerLevel

  public readonly layer = new Layer()

  public readonly ctx: Context

  public constructor(ctx: Context) {
    this.ctx = ctx
    this.init()
  }

  public abstract init(): void

  public load() {}

  public dispose() {}

  public getActive() {
    return this.ctx.layer.has(this.layer)
  }

  public setActive(active = true) {
    if (active) {
      this.ctx.layer.add(this.layer, this.level)
      this.load()
    } else {
      this.ctx.layer.remove(this.layer, this.level)
      this.dispose()
    }
  }

  public listen<K extends keyof EventsMapping>(type: K, callback: EventsMapping[K]) {
    return this.ctx.on(type, (...args: unknown[]) => {
      if (this.getActive()) (callback as (...args: unknown[]) => void)(...args)
    })
  }
}

export default Page
