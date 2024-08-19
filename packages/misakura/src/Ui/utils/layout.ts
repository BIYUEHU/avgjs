import { Container, type DisplayObject } from 'PIXI.JS'

export function createLayout<T extends unknown[]>(meta: T, handler: (data: T[number], index: number) => DisplayObject) {
  const container = new Container()
  container.addChild(...meta.map(handler))
  return container
}
