import { Container, type DisplayObject, type Sprite } from 'PIXI.JS'

export function createLayout<T extends unknown[]>(meta: T, handler: (data: T[number], index: number) => DisplayObject) {
  const container = new Container()
  container.addChild(...meta.map(handler))
  return container
}

interface AutoLayoutOptions {
  pos: [number, number]
  size?: { width: number; height: number }
  spacing?: number
  direction?: 'row' | 'column' | 'right' | 'left' | 'up' | 'down'
}

export function createAutoLayout<T>(
  meta: T[],
  { pos, size, spacing = 0, direction = 'row' }: AutoLayoutOptions,
  handler: (data: T, index: number) => DisplayObject | Sprite
): Container {
  const container = new Container()
  for (const [index, data] of meta.entries()) {
    const instance = handler(data, index)
    const width = size?.width ?? ('width' in instance ? instance.width : 0)
    const height = size?.height ?? ('height' in instance ? instance.height : 0)
    if ('anchor' in instance) instance.anchor.set(0.5, 0.5)

    const isEven = meta.length % 2 === 0
    const middleIndex = Math.floor((meta.length - 1) / 2)

    switch (direction) {
      case 'row':
        instance.position.set(
          isEven
            ? pos[0] + (index - middleIndex) * (width + spacing) - (width + spacing) / 2
            : pos[0] + (index - middleIndex) * (width + spacing),
          pos[1]
        )
        break
      case 'column':
        instance.position.set(
          pos[0],
          isEven
            ? pos[1] + (index - middleIndex) * (height + spacing) - (height + spacing) / 2
            : pos[1] + (index - middleIndex) * (height + spacing)
        )
        break
      case 'right':
        instance.position.set(pos[0] + (width + spacing) * index, pos[1])
        break
      case 'left':
        instance.position.set(pos[0] - (width + spacing) * index, pos[1])
        break
      case 'up':
        instance.position.set(pos[0], pos[1] - (height + spacing) * index)
        break
      case 'down':
        instance.position.set(pos[0], pos[1] + (height + spacing) * index)
        break
    }

    container.addChild(instance)
  }

  return container
}
