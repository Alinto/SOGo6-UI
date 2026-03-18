import { mailComposeReducer } from '@/features/mails/store'
import mailLayoutReducer from '@/features/mails/store/mail-layout-slice'
import mailNavigationReducer from '@/features/mails/store/mail-navigation-slice'
import { notificationsReducer } from '@/features/notifications'
import { configureStore, EnhancedStore } from '@reduxjs/toolkit'
import { apiSlice } from './api/api-slice'
import { listenerMiddleware } from './listener-middleware'
import { createReducerManager, ReducerManager } from './reducer-manager'
import { sseApi } from './sse/sse-api'
import authSlice from '@/features/auth/components/store/auth.slice'
import {
  localStorageSyncMiddleware,
  loadAuthFromStorage,
} from './middleware/local-storage-sync'

// Load auth state from localStorage on startup
const loadPreloadedState = () => {
  const savedAuth = loadAuthFromStorage()
  // Return saved auth or undefined to use slice's initialState
  return savedAuth ? { auth: savedAuth } : undefined
}

const staticReducers = {
  auth: authSlice,
  mailCompose: mailComposeReducer,
  mailLayout: mailLayoutReducer,
  mailNavigation: mailNavigationReducer,
  notifications: notificationsReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
  [sseApi.reducerPath]: sseApi.reducer,
}

export const reducerManager = createReducerManager(staticReducers)

export const makeStore = () => {
  const preloadedState = loadPreloadedState()

  const store = configureStore({
    reducer: reducerManager.reduce,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .prepend(listenerMiddleware.middleware)
        .concat(apiSlice.middleware)
        .concat(sseApi.middleware)
        .concat(localStorageSyncMiddleware),
  }) as EnhancedStore & ReducerManager

  store.add = reducerManager.add
  store.remove = reducerManager.remove
  store.getReducerMap = reducerManager.getReducerMap

  return store
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
