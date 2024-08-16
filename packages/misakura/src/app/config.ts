import { DEFAULT_CORE_OPTION } from '../constant'
import type { CoreOption } from '../types'

type RequiredCycle<T extends object> = {
  [K in keyof T]-?: T[K] extends object ? RequiredCycle<T[K]> : Required<T[K]>
}

export class Config {
  public readonly config: RequiredCycle<Omit<CoreOption, 'render'>> & { render?: CoreOption['render'] }

  public constructor(config?: CoreOption) {
    const opt = config ?? ({} as CoreOption)
    opt.styles = { ...DEFAULT_CORE_OPTION.styles, ...('styles' in opt ? opt.styles : {}) }
    this.config = { ...DEFAULT_CORE_OPTION, ...opt } as typeof this.config
  }
}

export default Config
