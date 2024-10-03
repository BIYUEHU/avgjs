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
import type LevelsAdapter from '../class/levels/LevelsAdapter'
import { FileAdapter } from '../class/levels/FileAdapter'
import { WebStorageAdapter } from '../class/levels/WebStorageAdapter'
import { logger } from '../tools/logger'
import { invoke } from '@tauri-apps/api'

export interface Context {
  meta: Config['meta']
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
  levels: LevelsAdapter
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
    this.mixin('config', ['config', 'meta'])
    this.provide('media', new Media(this))
    this.inject('media')
    this.provide('store', Store.getState())
    this.inject('store')
    this.provide('levels', new (this.meta.isRust ? FileAdapter : WebStorageAdapter)(this))
    this.inject('levels')
    this.provide('controller', new Controller(this))
    this.mixin('controller', ['app', 'layer', 'pages', 'listen', 'clear', 'height', 'width', 'path'], true)

    if (!this.meta.isDev) return
    ;(window as unknown as { ms: Context }).ms = this
    logger.debug('Misakura initialized')
    const getSign = (bool: boolean) => (bool ? '✅' : '❌')
    logger.debug(`Dev mode: ${getSign(this.meta.isDev)}`)
    logger.debug(`Application Program(File Support): ${getSign(this.meta.isRust)}`)
    logger.debug(`Is Portrait: ${getSign(this.meta.isPortrait)}`)
    logger.debug(`Screen WH: ${this.meta.standardAspect[0]} x ${this.meta.standardAspect[1]}`)
    if (!this.meta.isRust) return
    invoke('get_base_directory').then((dir) => {
      logger.debug(`Base Directory: ${dir}`)
    })
  }

  public start() {
    for (const pageName in routes) this.pages[pageName as 'home'] = new routes[pageName as 'home'](this)
    this.emit('ready')
    this.on('exit', () => {
      this.clear()
      if (this.meta.isRust) appWindow.close()
    })
  }
}

export default Context
