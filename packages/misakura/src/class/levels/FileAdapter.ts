import { none } from '@kotori-bot/core'
import LevelsAdapter from './LevelsAdapter'
import type { LevelsData } from './LevelsAdapter'
import { invoke } from '@tauri-apps/api'
import { logger } from '../../tools/logger'

export class FileAdapter extends LevelsAdapter {
  public async getAll() {
    return ((await invoke('get_all_levels')) as [string, string, string][])
      .map(([name, pngData, datContent]) => {
        const key = Number(name)
        if (Number.isNaN(key)) {
          logger.warn(`Invalid level name: ${name}`)
          return null
        }
        if (!pngData) {
          logger.warn(`Level ${name} has no icon data`)
          return null
        }
        try {
          return { ...JSON.parse(datContent), icon: pngData, position: key }
        } catch {
          logger.warn(`Level ${name} has invalid data: ${datContent}`)
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
