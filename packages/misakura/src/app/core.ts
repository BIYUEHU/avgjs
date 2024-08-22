import Controller from './controller'
import FluoroContext from 'fluoro'
import type { EventsMapping as FluoroEventsMapping, EventsList as FluoroEventsList } from 'fluoro'
import Config from './config'
import { routes } from './routes'
import type { Page } from '../class/page'
import Media from './media'
import Store from './store'
import type { MisakuraState } from './store'
import { appWindow } from '@tauri-apps/api/window'

export interface Context {
  config: Config['config']
  app: Controller['app']
  pages: Controller['pages']
  layer: Controller['layer']
  clear: Controller['clear']
  listen: Controller['listen']
  height: Controller['height']
  width: Controller['width']
  path: Controller['path']
  store: {
    // biome-ignore lint:
    [K in keyof MisakuraState]: MisakuraState[K] extends (...args: any[]) => any ? MisakuraState[K] : never
  }
  media: Media
}

export interface EventsMapping extends FluoroEventsMapping {
  exit(): void
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
    this.provide('media', new Media(this))
    this.inject('media')
    this.provide('store', Store.getState())
    this.inject('store')
    this.provide('controller', new Controller(this))
    this.mixin('controller', ['app', 'layer', 'pages', 'listen', 'clear', 'height', 'width', 'path'], true)

    // ? DEBUG and more better supports
    ;(window as unknown as { ms: Context }).ms = this
  }

  public start() {
    for (const pageName in routes) this.pages[pageName as 'home'] = new routes[pageName as 'home'](this)
    this.emit('ready')
    this.on('exit', () => {
      this.clear()
      appWindow.close()
    })
  }
}

export default Context
