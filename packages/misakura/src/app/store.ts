import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { DEFAULT_CORE_OPTION } from '../constant'
import defu from 'defu'
import type Character from '../class/character'
import type { LevelsData } from '../class/levels/LevelsAdapter'

type ValuesType = string | number | boolean
type ValuesList = Record<string, ValuesType>

export interface MisakuraState {
  dialog: {
    script: { entry: string; line: number }
    background: string
    music: { name: string; seconds: number }
    characters: { identity: string; name: string; figure?: string; position?: Character['position'] }[]
    speaker: string
    values: { constant: ValuesList; variables: ValuesList }
  }
  levels: LevelsData[]
  lastPages: string[]
  isFull: boolean
  historyPages: string[]
  isFinalPlot: boolean
  getDialogScript(): string
  setDialogScript(
    script: { entry: string; line: number },
    extend?: boolean | Omit<MisakuraState['dialog'], 'script'>
  ): void
  getDialogLine(): number
  setDialogLine(line: number): void
  nextDialogLine(): void
  getDialogBackground(): string
  setDialogBackground(background: string): void
  getDialogSpeaker(): string
  setDialogSpeaker(speaker: string): void
  getDialogCharacters(): MisakuraState['dialog']['characters']
  setDialogCharacters(...characters: Character[]): void
  getDialogMusic(): MisakuraState['dialog']['music']
  setDialogMusic(): void
  setDialogMusic(name: string, seconds: number): void
  getDialogConstant(): ValuesList
  getDialogConstant(name: string): ValuesType | undefined
  setDialogConstant(name: string, value: ValuesType): void
  setDialogConstant(list: ValuesList): void
  getDialogVariable(): ValuesList
  getDialogVariable(name: string): ValuesType | undefined
  setDialogVariable(name: string, value: ValuesType): void
  getLastPage(): string[]
  setLastPage(pages: string[]): void
  getHistoryPage(): string[]
  setHistoryPage(page: string): void
  clearHistoryPage(): void
  getFinalPlot(): boolean
  openFinalPlot(): void
  full(state?: boolean): boolean
  getLevels(): LevelsData[]
  setLevels(levels: LevelsData[]): void
  getDialogAll(): MisakuraState['dialog']
}

const initialized = {
  dialog: {
    script: { entry: '', line: 0 },
    background: DEFAULT_CORE_OPTION.styles.background,
    music: { name: '', seconds: 0 },
    characters: [],
    speaker: '',
    values: {
      constant: {},
      variables: {}
    }
  },
  levels: [],
  lastPages: [],
  isFull: false,
  historyPages: [],
  isFinalPlot: false
}

const Store = create(
  persist<MisakuraState>(
    (set, get) => ({
      ...initialized,
      getDialogScript() {
        return get().dialog.script.entry
      },
      setDialogScript(script: { entry: string; line: number }, extend = false) {
        set((state) => ({
          dialog: { ...(extend ? (extend === true ? state.dialog : extend) : initialized.dialog), script }
        }))
      },
      getDialogLine() {
        return get().dialog.script.line
      },
      setDialogLine(line: number) {
        set((state) => ({
          dialog: { ...state.dialog, script: defu({ line }, state.dialog.script) }
        }))
      },
      nextDialogLine() {
        set((state) => ({
          dialog: { ...state.dialog, script: defu({ line: state.dialog.script.line + 1 }, state.dialog.script) }
        }))
      },
      getDialogBackground() {
        return get().dialog.background
      },
      setDialogBackground(background: string) {
        set((state) => ({ dialog: defu({ background }, state.dialog) }))
      },
      getDialogSpeaker() {
        return get().dialog.speaker
      },
      setDialogSpeaker(speaker: string) {
        set((state) => ({ dialog: defu({ speaker }, state.dialog) }))
      },
      getDialogCharacters() {
        return get().dialog.characters
      },
      setDialogCharacters(...characters: Character[]) {
        set((state) => ({
          dialog: {
            ...state.dialog,
            characters: characters.map((char) => {
              const origin = get().dialog.characters.find((target) => char.identity === target.identity)
              return {
                identity: char.identity,
                name: origin?.name && char.name === char.identity ? origin.name : char.name,
                figure: char.figureAssets ?? origin?.figure,
                position: char.position ?? origin?.position
              }
            })
          }
        }))
      },
      getDialogMusic() {
        return get().dialog.music
      },
      setDialogMusic(name?: string, seconds?: number) {
        if (name === undefined) {
          set((state) => ({ dialog: defu({ music: initialized.dialog.music }, state.dialog) }))
          return
        }

        set((state) => ({ dialog: defu({ music: { name, seconds: seconds ?? 0 } }, state.dialog) }))
      },
      // biome-ignore lint:
      getDialogConstant(name?: string): any {
        const constants = get().dialog.values.constant
        return name === undefined ? constants : constants[name]
      },
      setDialogConstant(name: string | ValuesList, value?: ValuesType) {
        if (typeof name !== 'string') {
          set((state) => ({ dialog: defu({ values: { constant: name } }, state.dialog) }))
          return
        }
        set((state) => ({ dialog: defu({ values: { constant: { [name]: value } } }, state.dialog) }))
      },
      // biome-ignore lint:
      getDialogVariable(name?: string): any {
        return name === undefined ? get().dialog.values.variables : get().dialog.values.variables[name]
      },
      setDialogVariable(name: string, value: ValuesType) {
        set((state) => ({
          dialog: defu({ values: { variables: { [name]: value } } }, state.dialog)
        }))
      },
      getLastPage() {
        return get().lastPages
      },
      setLastPage(pages: string[]) {
        set(() => ({ lastPages: pages }))
      },
      getHistoryPage() {
        return get().historyPages
      },
      setHistoryPage(page: string) {
        set((state) => ({ historyPages: [...state.historyPages, page] }))
      },
      clearHistoryPage() {
        set(() => ({ historyPages: [] }))
      },
      getFinalPlot() {
        return get().isFinalPlot
      },
      openFinalPlot() {
        set(() => ({ isFinalPlot: true }))
      },
      full(state?: boolean) {
        if (state === undefined) return this.isFull
        set(() => ({ isFull: state }))
        return state
      },
      getLevels() {
        return get().levels
      },
      setLevels(levels: LevelsData[]) {
        set(() => ({ levels }))
      },
      getDialogAll() {
        return get().dialog
      }
    }),
    {
      name: 'misakura',
      storage: createJSONStorage(() => localStorage)
    }
  )
)

export default Store
