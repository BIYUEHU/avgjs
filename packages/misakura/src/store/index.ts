import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { DEFAULT_CORE_OPTION } from '../constant'
import defu from 'defu'
import type Character from '../components/character'

interface MisakuraState {
  dialog: {
    script: { entry: string; line: number }
    background: string
    music: { name: string; seconds: number }
    characters: { identity: string; name: string; figure?: string; position?: Character['position'] }[]
    speaker: string
  }
  getDialogData(): MisakuraState['dialog']
  setDialogData(script: { entry: string; line: number }): void
  getDialogScript(): string
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
  setDialogMusic(name: string, maxSeconds: number): void
}

const initialized = {
  dialog: {
    script: {
      entry: '',
      line: 0
    },
    background: DEFAULT_CORE_OPTION.styles.background,
    music: {
      name: '',
      seconds: 0
    },
    characters: [],
    speaker: ''
  }
}

const useStore = create(
  persist<MisakuraState>(
    (set, get) => ({
      ...initialized,
      getDialogData() {
        return get().dialog
      },
      setDialogData(script: { entry: string; line: number }) {
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
      setDialogMusic(name?: string, maxSeconds?: number) {
        if (!name || !maxSeconds) {
          set((state) => ({ dialog: defu({ music: initialized.dialog.music }, state.dialog) }))
          return
        }

        set((state) => ({ dialog: defu({ music: { name, seconds: 0 } }, state.dialog) }))
        const startTime = Date.now()
        const timerIntervalSeconds = 0.5
        const timerId = setInterval(() => {
          if (get().dialog.music.name !== name) {
            clearInterval(timerId)
            return
          }
          const playSeconds = (Date.now() - startTime) / 1000
          if (playSeconds > maxSeconds) {
            set((state) => ({ dialog: defu({ music: { name, seconds: playSeconds - maxSeconds } }, state.dialog) }))
            return
          }
          set((state) => ({
            dialog: defu({ music: { name, seconds: playSeconds + timerIntervalSeconds } }, state.dialog)
          }))
        }, timerIntervalSeconds * 1000)
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
  getDialogBackground,
  setDialogBackground,
  getDialogSpeaker,
  setDialogSpeaker,
  getDialogCharacters,
  setDialogCharacters,
  getDialogMusic,
  setDialogMusic
} = store

export default store
