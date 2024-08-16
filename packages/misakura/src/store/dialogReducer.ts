import { createSlice } from '@reduxjs/toolkit'
import { DEFAULT_CORE_OPTION } from '../constant'

export const dialogSlice = createSlice({
  name: 'dialog',
  initialState: {
    background: DEFAULT_CORE_OPTION.styles.background,
    music: {
      name: '',
      time: 0
    },
    scripts: {
      entry: '',
      line: 0
    },
    characters: [] as string[]
  },
  reducers: {
    setBackground: (state, { payload }: { payload: string }) => {
      state.background = payload
    },
    setMusic: (state, { payload }: { payload: { name: string; time: number } }) => {
      state.music = payload
    },
    setScript: (state, { payload }: { payload: { entry: string; line: number } }) => {
      state.scripts = payload
    }
    // setCharacter: (state, { payload }: { payload: { identity: string; option: CharacterOption } }) => {
    //   state.characters.push(payload)
    // }
  }
})

export const { setBackground, setMusic, setScript } = dialogSlice.actions

export default dialogSlice.reducer
