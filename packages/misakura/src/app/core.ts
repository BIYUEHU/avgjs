import Controller from './controller'
import FluoroContext from 'fluoro'
import type { EventsMapping as FluoroEventsMapping, EventsList as FluoroEventsList } from 'fluoro'
import Config from './config'
import { routes } from '../pages'
import type { Page } from '../components/page'

export interface Context {
  config: Config['config']
  app: Controller['app']
  pages: Controller['pages']
  layer: Controller['layer']
  clear: Controller['clear']
  listen: Controller['listen']
  height: Controller['height']
  width: Controller['width']
  calcX: Controller['calcX']
  calcY: Controller['calcY']
}

export interface EventsMapping extends FluoroEventsMapping {
  next_dialog(): void
  resize(): void
  initialized(): void
  page_update(): void
  page_active_change(page: Page): void
}

export type EventsList = FluoroEventsList<EventsMapping>

// biome-ignore lint:
export class Context extends FluoroContext<EventsMapping> implements Context {
  public constructor(config?: ConstructorParameters<typeof Config>[0]) {
    super()
    this.provide('config', new Config(config))
    this.mixin('config', ['config'])
    this.provide('controller', new Controller(this))
    this.mixin('controller', ['app', 'layer', 'pages', 'listen', 'clear', 'height', 'width', 'calcX', 'calcY'], true)

    // ? DEBUG
    ;(window as unknown as { ms: Context }).ms = this
  }

  public start() {
    for (const pageName in routes) this.pages[pageName as 'home'] = new routes[pageName as 'home'](this)
    this.pages.home.setActive()
    this.emit('ready')
  }
}

export default Context
