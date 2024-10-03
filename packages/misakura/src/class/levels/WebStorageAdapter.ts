import LevelsAdapter from './LevelsAdapter'
import type { LevelsData } from './LevelsAdapter'

export class WebStorageAdapter extends LevelsAdapter {
  public async getAll() {
    return this.ctx.store.getLevels()
  }

  public async set(key: number, value: LevelsData) {
    const levels = this.ctx.store.getLevels()
    const targetIndex = levels.findIndex(({ position }) => position === key)
    levels[targetIndex > -1 ? targetIndex : levels.length] = value
    this.ctx.store.setLevels(levels)
  }
}
