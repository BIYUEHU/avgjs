import type { DisplayObject, Application } from 'pixi.js'
import type { Layer } from '../class'

export interface CoreOption {
  entry?: string
  element?: HTMLElement
  render?: Exclude<ConstructorParameters<typeof Application>[0], 'width' | 'height'>

  // ! This will be removed or changed in the future about UI system design.
  styles?: {
    background?: string
    dialog?: string
    dialogX?: number
    dialogY?: number
    dialogNameX?: number
    dialogNameY?: number
    dialogNameSize?: number
    dialogMsgX?: number
    dialogMsgY?: number
    dialogMsgWrap?: number
    dialogMsgSize?: number
    margin?: number
    characterHeight?: number
  }
  basedir?: {
    // gui?: string
    fonts?: string
    scripts?: string
    background?: string
    figure?: string
    voice?: string
    music?: string
    sound?: string
    video?: string
  }
}

export enum LayerLevel {
  AFTER = 0,
  MIDDLE = 1,
  BEFORE = 2
}

export type Elements = DisplayObject | Layer

export interface CharacterOption {
  name?: string
  figure?: string
  show?: boolean
}
