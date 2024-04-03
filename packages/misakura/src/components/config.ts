import type { Application } from 'PIXI.js';
import { DEFAULT_VISUAL_OPTION } from '../const';

interface VisualOption {
  render?: Exclude<ConstructorParameters<typeof Application>[0], 'width' | 'height'>;
  styles?: {
    background?: string;
    dialog?: string;
    dialogX?: number;
    dialogY?: number;
    dialogNameX?: number;
    dialogNameY?: number;
    dialogNameSize?: number;
    dialogMsgX?: number;
    dialogMsgY?: number;
    dialogMsgWrap?: number;
    dialogMsgSize?: number;
    margin?: number;
    characterHeight?: number;
  };
  entry: string;
}

type RequiredCycle<T extends object> = {
  [K in keyof T]-?: T[K] extends object ? RequiredCycle<T[K]> : Required<T[K]>;
};

export class Config {
  public readonly config: RequiredCycle<Omit<VisualOption, 'render'>> & { render?: VisualOption['render'] };

  public constructor(config?: VisualOption) {
    const opt = config ?? ({} as VisualOption);
    opt.styles = { ...DEFAULT_VISUAL_OPTION.styles, ...('styles' in opt ? opt.styles : {}) };
    this.config = { ...DEFAULT_VISUAL_OPTION, ...opt } as typeof this.config;
  }
}

export default Config;
