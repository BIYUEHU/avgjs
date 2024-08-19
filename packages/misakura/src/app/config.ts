import defu from 'defu'
import { DEFAULT_CORE_OPTION } from '../constant'
import type { CoreOption } from '../types'

type RequiredCycle<T extends object> = {
  [K in keyof T]-?: T[K] extends object ? RequiredCycle<T[K]> : Required<T[K]>
}

export class Config {
  public readonly config: RequiredCycle<Omit<CoreOption, 'render'>> & { render?: CoreOption['render'] }

  public constructor(config?: CoreOption) {
    this.config = defu(config, DEFAULT_CORE_OPTION) as typeof this.config
  }
}

export default Config
