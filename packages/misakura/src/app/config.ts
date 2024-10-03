import defu from 'defu'
import { DEFAULT_CORE_OPTION } from '../constant'
import type { CoreOption } from '../types'
import isDev from '../tools/isDev'

type RequiredCycle<T extends object> = {
  [K in keyof T]-?: T[K] extends object ? RequiredCycle<T[K]> : Required<T[K]>
}

interface MetaInformation {
  readonly isDev: boolean
  readonly isRust: boolean
  readonly isPortrait: boolean
  readonly standardAspect: [number, number]
}

export class Config {
  public readonly meta: MetaInformation = {
    isDev: isDev(),
    isRust: '__TAURI__' in window && typeof window.__TAURI__ === 'object',
    isPortrait: window.innerHeight > window.innerWidth,
    standardAspect: [1920, 1080]
  }

  public readonly config: RequiredCycle<Omit<CoreOption, 'render'>> & { render?: CoreOption['render'] }

  public constructor(config?: CoreOption) {
    this.config = defu(config, DEFAULT_CORE_OPTION) as typeof this.config
  }
}

export default Config
