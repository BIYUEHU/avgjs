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

  public getActive(isUnique = false): boolean {
    const result =
      this.ctx.layer.has(this.layer, 'all') &&
      (!isUnique || Object.values(this.ctx.pages).filter((page) => page.getActive()).length === 1)
    return result
  }

  public setActive(active = true, clear = true) {
    if (active) {
      const shownList = Object.entries(this.ctx.pages).filter(([, page]) => page.getActive())
      const currentPage = shownList.length > 0 ? shownList[shownList.length - 1][0] : undefined
      if (currentPage) this.ctx.store.setHistoryPage(currentPage)
      if (clear) this.ctx.clear()
      this.ctx.layer.add(this.layer, this.level)
      if (!this.isLoadOnce) {
        this.loadOnce()
        this.isLoadOnce = true
      }
      this.load()
    } else {
      this.ctx.layer.remove(this.layer, this.level)
      this.dispose()
    }
    this.ctx.emit('page_active_change', this)
  }

  public getName() {
    return Object.entries(this.ctx.pages).find(([, page]) => page === this)?.[0] ?? 'unknown'
  }

  public once<K extends keyof EventsMapping>(type: K, callback: EventsMapping[K]) {
    const newCallback = (...args: unknown[]) => {
      if (this.getActive()) return (callback as (...args: unknown[]) => void)(...args)
      this.once(type, callback)
    }
    this.ctx.once(type, newCallback)
    return () => this.ctx.off(type, newCallback)
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
