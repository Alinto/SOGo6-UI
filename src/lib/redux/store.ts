import { configureStore, EnhancedStore } from '@reduxjs/toolkit'
import { apiSlice } from './api/api-slice'
import { listenerMiddleware } from './listener-middleware'
import { createReducerManager, ReducerManager } from './reducer-manager'

const staticReducers = {
  [apiSlice.reducerPath]: apiSlice.reducer,
}
export const reducerManager = createReducerManager(staticReducers)

export const makeStore = () => {
  const store = configureStore({
    reducer: reducerManager.reduce,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .prepend(listenerMiddleware.middleware)
        .concat(apiSlice.middleware),
  }) as EnhancedStore & ReducerManager

  store.add = reducerManager.add
  store.remove = reducerManager.remove
  store.getReducerMap = reducerManager.getReducerMap

  return store
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
