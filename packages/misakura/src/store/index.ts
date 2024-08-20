import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { DEFAULT_CORE_OPTION } from '../constant'
import defu from 'defu'
import type Character from '../class/character'

type ValuesType = string | number | boolean
type ValuesList = Record<string, ValuesType>

interface MisakuraState {
  dialog: {
    script: { entry: string; line: number; part: number; count: number }
    background: string
    music: { name: string; seconds: number }
    characters: { identity: string; name: string; figure?: string; position?: Character['position'] }[]
    speaker: string
    values: { constant: ValuesList; global: ValuesList; local: ValuesList }
  }
  lastPages: string[]
  historyPages: string[]
  getDialogData(): MisakuraState['dialog']
  setDialogData(script: { entry: string; line: number; part: number; count: number }): void
  getDialogScript(): string
  getDialogLine(): number
  setDialogLine(line: number): void
  nextDialogLine(): void
  getDialogPart(): number
  setDialogPart(part: number): void
  nextDialogPart(): void
  getDialogCount(): number
  // setDialogCount(count: number): void
  nextDialogCount(): void
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
  getDialogVariable(global?: boolean): ValuesList
  getDialogVariable(name: string): ValuesType | undefined
  setDialogVariable(name: string, value: ValuesType, global?: boolean): void
  getDialogVariableType(name: string): 'global' | 'local' | undefined
  getLastPage(): string[]
  setLastPage(pages: string[]): void
  getHistoryPage(): string[]
  setHistoryPage(page: string): void
  clearHistoryPage(): void
}

const initialized = {
  dialog: {
    script: {
      entry: '',
      line: 0,
      part: 0,
      count: 0
    },
    background: DEFAULT_CORE_OPTION.styles.background,
    music: {
      name: '',
      seconds: 0
    },
    characters: [],
    speaker: '',
    values: {
      constant: {},
      global: {},
      local: {}
    }
  },
  lastPages: [],
  historyPages: []
}

const useStore = create(
  persist<MisakuraState>(
    (set, get) => ({
      ...initialized,
      getDialogData() {
        return get().dialog
      },
      setDialogData(script: { entry: string; line: number; part: number; count: number }) {
        set(() => ({ dialog: { ...initialized.dialog, script } }))
      },
      getDialogScript() {
        return get().dialog.script.entry
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
      getDialogPart() {
        return get().dialog.script.part
      },
      setDialogPart(part: number) {
        set((state) => ({
          dialog: { ...state.dialog, script: defu({ part, count: 0 }, state.dialog.script) }
        }))
      },
      nextDialogPart() {
        set((state) => ({
          dialog: {
            ...state.dialog,
            script: defu({ part: state.dialog.script.part + 1, count: 0 }, state.dialog.script)
          }
        }))
      },
      getDialogCount() {
        return get().dialog.script.count
      },
      // setDialogCount(count: number) {
      //   set((state) => ({
      //     dialog: { ...state.dialog, script: defu({ count }, state.dialog.script) }
      //   }))
      // },
      nextDialogCount() {
        set((state) => ({
          dialog: { ...state.dialog, script: defu({ count: state.dialog.script.count + 1 }, state.dialog.script) }
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
      getDialogVariable(name: string | boolean = false): any {
        if (typeof name === 'boolean') return get().dialog.values[name ? 'global' : 'local']
        return get().dialog.values.global[name] ?? get().dialog.values.local[name]
      },
      setDialogVariable(name: string, value: ValuesType, global = false) {
        const handleGlobal = getDialogVariableType(name) ?? global ? 'global' : 'local'
        set((state) => ({
          dialog: defu({ values: { [handleGlobal]: { [name]: value } } }, state.dialog)
        }))
      },
      getDialogVariableType(name: string) {
        return get().dialog.values.global[name] ? 'global' : get().dialog.values.local[name] ? 'local' : undefined
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
      }
    }),
    {
      name: 'misakura',
      storage: createJSONStorage(() => localStorage)
    }
  )
)

const store = useStore.getState()

export const {
  getDialogData,
  setDialogData,
  getDialogScript,
  getDialogLine,
  setDialogLine,
  nextDialogLine,
  getDialogPart,
  setDialogPart,
  nextDialogPart,
  getDialogCount,
  nextDialogCount,
  getDialogBackground,
  setDialogBackground,
  getDialogSpeaker,
  setDialogSpeaker,
  getDialogCharacters,
  setDialogCharacters,
  getDialogMusic,
  setDialogMusic,
  getDialogConstant,
  setDialogConstant,
  getDialogVariable,
  setDialogVariable,
  getDialogVariableType,
  getLastPage,
  setLastPage,
  getHistoryPage,
  setHistoryPage,
  clearHistoryPage
} = store

export default store
