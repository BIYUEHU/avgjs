import type { DisplayObject, Application } from 'PIXI.JS'
import type { Layer } from '../components'

export interface CoreOption {
  entry?: string
  element?: HTMLElement
  render?: Exclude<ConstructorParameters<typeof Application>[0], 'width' | 'height'>
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
}

export enum LayerLevel {
  BEFORE = 0,
  MIDDLE = 1,
  AFTER = 2
}

export type Elements = DisplayObject | Layer

export interface CharacterOption {
  name?: string
  figure?: string
  show?: boolean
}
