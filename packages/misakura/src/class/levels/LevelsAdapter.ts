import type Context from '../..'
import type { MisakuraState } from '../../app/store'
import Tsu from 'tsukiko'

export const levelsDataSchema = Tsu.Object({
  position: Tsu.Number().int(),
  data: Tsu.Object(),
  date: Tsu.Number().int(),
  name: Tsu.String(),
  icon: Tsu.String()
})

export type LevelsData = Tsu.infer<typeof levelsDataSchema> & { data: MisakuraState['dialog'] }

export abstract class LevelsAdapter {
  protected readonly ctx: Context

  public constructor(ctx: Context) {
    this.ctx = ctx
  }

  abstract getAll(): Promise<LevelsData[]>
  abstract set(key: number, data: LevelsData): Promise<void>
  // abstract delete(position: number): void
}

export default LevelsAdapter
