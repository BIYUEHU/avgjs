import { combineReducers, configureStore } from '@reduxjs/toolkit'
import storage from 'redux-persist/lib/storage'
import dialogReducer from './dialogReducer'
import { persistReducer } from 'redux-persist'
import persistStore from 'redux-persist/es/persistStore'
import settingsReducer from './settingsReducer'

const persistedReducer = persistReducer(
  {
    key: 'misakura',
    storage,
    whitelist: ['dialog']
  },
  combineReducers({
    dialog: dialogReducer,
    settings: settingsReducer
  })
)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})

export default store
export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
