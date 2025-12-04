// import authReducer from '@/features/auth/auth-slice'
import { mailComposeReducer } from '@/features/mails/store'
import { configureStore, EnhancedStore } from '@reduxjs/toolkit'
import { apiSlice } from './api/api-slice'
import { listenerMiddleware } from './listener-middleware'
import { createReducerManager, ReducerManager } from './reducer-manager'
import { sseApi } from './sse/sse-api'
const staticReducers = {
  // auth: authReducer,
  mailCompose: mailComposeReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
  [sseApi.reducerPath]: sseApi.reducer,
}
export const reducerManager = createReducerManager(staticReducers)

export const makeStore = () => {
  const store = configureStore({
    reducer: reducerManager.reduce,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .prepend(listenerMiddleware.middleware)
        .concat(apiSlice.middleware)
        .concat(sseApi.middleware),
  }) as EnhancedStore & ReducerManager

  store.add = reducerManager.add
  store.remove = reducerManager.remove
  store.getReducerMap = reducerManager.getReducerMap

  return store
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
