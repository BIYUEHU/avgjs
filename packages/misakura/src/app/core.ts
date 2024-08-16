import Controller from './controller'
import FluoroContext from 'fluoro'
import type { EventsMapping as FluoroEventsMapping, EventsList as FluoroEventsList } from 'fluoro'
import Config from './config'
import { routes } from '../pages'

export interface Context {
  config: Config['config']
  app: Controller['app']
  pages: Controller['pages']
  layer: Controller['layer']
  // checkout: Controller['checkout']
  height: Controller['height']
  width: Controller['width']
  calcX: Controller['calcX']
  calcY: Controller['calcY']
}

export interface EventsMapping extends FluoroEventsMapping {
  next_dialog(): void
  resize(): void
  initialized(): void
}

export type EventsList = FluoroEventsList<EventsMapping>

// biome-ignore lint:
export class Context extends FluoroContext<EventsMapping> implements Context {
  public constructor(config?: ConstructorParameters<typeof Config>[0]) {
    super()
    this.provide('config', new Config(config))
    this.mixin('config', ['config'])
    this.provide('controller', new Controller(this))
    this.mixin('controller', ['app', 'layer', 'pages', 'view', 'height', 'width', 'calcX', 'calcY'], true)
  }

  public start() {
    for (const pageName in routes) this.pages[pageName as 'home'] = new routes[pageName as 'home'](this)
    this.pages.home.setActive()
    this.emit('ready')
  }
}

export default Context
