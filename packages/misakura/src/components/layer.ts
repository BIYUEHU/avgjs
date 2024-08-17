import { Container, type DisplayObject, type AllFederatedEventMap } from 'PIXI.JS'
import { type Elements, LayerLevel } from '../types'

export class Layer {
  public static getDisplayObjectSingle(element: Elements) {
    return element instanceof Layer ? element.combine()[0] : element
  }
  public static getDisplayObject(element: Elements) {
    return element instanceof Layer ? element.combine() : [element]
  }

  public readonly before = new Container()
  public readonly middle = new Container()
  public readonly after = new Container()

  public combine() {
    return [this.before, this.middle, this.after]
  }

  public remove(elements: Elements | Elements[], type: 'all' | LayerLevel = 'all') {
    if (type === 'all') {
      this.remove(elements, LayerLevel.BEFORE)
      this.remove(elements, LayerLevel.MIDDLE)
      this.remove(elements, LayerLevel.AFTER)
      return
    }
    if (Array.isArray(elements)) {
      for (const el of elements) this.remove(el, type)
      return
    }
    this.combine()[type].removeChild(...Layer.getDisplayObject(elements))
  }

  public add(elements: Elements | Elements[], type: LayerLevel = LayerLevel.MIDDLE) {
    if (Array.isArray(elements)) {
      for (const el of elements) this.add(el, type)
      return
    }
    this.combine()[type].addChild(...Layer.getDisplayObject(elements))
  }

  public addAt(element: Elements, index: number, type: LayerLevel = LayerLevel.MIDDLE) {
    this.combine()[type].addChildAt(Layer.getDisplayObjectSingle(element), index)
  }

  public removeAt(index: number, type: LayerLevel = LayerLevel.MIDDLE) {
    this.combine()[type].removeChildAt(index)
  }

  public has(element: Elements, type: 'all' | LayerLevel = 'all'): boolean {
    if (type === 'all') {
      return (
        this.has(element, LayerLevel.BEFORE) ||
        this.has(element, LayerLevel.MIDDLE) ||
        this.has(element, LayerLevel.AFTER)
      )
    }
    return !!this.combine()[type].children.find((target) => target === Layer.getDisplayObjectSingle(element))
  }

  public findIndex(callback: (target: DisplayObject) => boolean, type: LayerLevel = LayerLevel.MIDDLE) {
    return this.combine()[type].children.findIndex(callback)
  }

  public listen<K extends keyof AllFederatedEventMap>(
    eventName: K,
    callback: (event: AllFederatedEventMap[K]) => unknown,
    type: 'all' | LayerLevel = 'all'
  ) {
    if (type === 'all') {
      this.listen(eventName, callback, LayerLevel.BEFORE)
      this.listen(eventName, callback, LayerLevel.MIDDLE)
      this.listen(eventName, callback, LayerLevel.AFTER)
      return
    }
    ;(this.combine()[type].addEventListener as (...args: unknown[]) => void)(eventName, callback)
  }
}
