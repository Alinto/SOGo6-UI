import {
  Action,
  combineReducers,
  Reducer,
  ReducersMapObject,
} from '@reduxjs/toolkit'

export interface ReducerManager {
  getReducerMap: () => ReducersMapObject
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reduce: (_state: any, _action: Action) => any
  add: (_key: string, _reducer: Reducer) => void
  remove: (_key: string) => void
}

export function createReducerManager(
  initialReducers: ReducersMapObject
): ReducerManager {
  const reducers = { ...initialReducers }
  let combinedReducer = combineReducers(reducers)
  let keysToRemove: string[] = []

  return {
    getReducerMap: () => reducers,
    reduce: (state, action) => {
      if (keysToRemove.length > 0) {
        state = { ...state }
        for (const key of keysToRemove) {
          delete state[key]
        }
        keysToRemove = []
      }
      return combinedReducer(state, action)
    },
    add: (key, reducer) => {
      if (!key || reducers[key]) {
        return
      }
      reducers[key] = reducer
      combinedReducer = combineReducers(reducers)
    },
    remove: (key) => {
      if (!key || !reducers[key]) {
        return
      }
      delete reducers[key]
      keysToRemove.push(key)
      combinedReducer = combineReducers(reducers)
    },
  }
}
