import { none } from '@kotori-bot/core'
import LevelsAdapter from './LevelsAdapter'
import type { LevelsData } from './LevelsAdapter'
import { invoke } from '@tauri-apps/api'

export class FileAdapter extends LevelsAdapter {
  public async getAll() {
    return ((await invoke('get_all_levels')) as [string, string, string][])
      .map(([name, pngData, datContent]) => {
        const key = Number(name)
        if (Number.isNaN(key)) return null
        if (!pngData) return null
        try {
          return { ...JSON.parse(datContent), icon: pngData, position: key }
        } catch {
          return null
        }
      })
      .filter((it) => !!it)
  }

  public async set(key: number, value: LevelsData) {
    none(key, value)
    await invoke('set_levels', {
      name: key.toString(),
      pngData: value.icon,
      datContent: JSON.stringify({ ...value, icon: undefined })
    })
  }
}
