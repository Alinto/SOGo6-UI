'use client'

import { useCallback, useEffect, useState } from 'react'
import { getAuthUserId } from '../auth/get-auth-token'
import {
  countPendingOutbox,
  deleteOutboxItem,
  getOutboxItem,
  listOutbox,
  upsertOutboxItem,
} from '../db/outbox-store'
import { isPwaOutboxEnabled } from '../flags'
import {
  notifyOutboxChanged,
  subscribeOutboxChanged,
} from '../outbox/outbox-events'
import type { OutboxRecord } from '../types'

interface OutboxListState {
  items: OutboxRecord[]
  pendingCount: number
  loading: boolean
}

const EMPTY: Pick<OutboxListState, 'items' | 'pendingCount'> = {
  items: [],
  pendingCount: 0,
}

async function loadOutbox(): Promise<
  Pick<OutboxListState, 'items' | 'pendingCount'>
> {
  if (!isPwaOutboxEnabled()) return EMPTY
  const userId = getAuthUserId()
  if (!userId) return EMPTY
  const [items, pendingCount] = await Promise.all([
    listOutbox(userId),
    countPendingOutbox(userId),
  ])
  return { items, pendingCount }
}

export function useOutboxList() {
  const [state, setState] = useState<OutboxListState>({
    items: [],
    pendingCount: 0,
    loading: true,
  })

  const refresh = useCallback(async () => {
    const next = await loadOutbox()
    setState({ ...next, loading: false })
  }, [])

  useEffect(() => {
    let cancelled = false
    const load = () => {
      void loadOutbox().then((next) => {
        if (!cancelled) setState({ ...next, loading: false })
      })
    }
    load()
    // Keeps every instance (sidebar badge, outbox page) in sync after an
    // enqueue, an auto-flush — possibly run by another tab — or an edit.
    const unsubscribe = subscribeOutboxChanged(load)
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  const remove = useCallback(
    async (id: string) => {
      const userId = getAuthUserId()
      if (!userId) return
      await deleteOutboxItem(userId, id)
      notifyOutboxChanged()
      await refresh()
    },
    [refresh]
  )

  const save = useCallback(
    async (item: OutboxRecord) => {
      await upsertOutboxItem({ ...item, updatedAt: Date.now() })
      notifyOutboxChanged()
      await refresh()
    },
    [refresh]
  )

  const getOne = useCallback(async (id: string) => {
    const userId = getAuthUserId()
    if (!userId) return undefined
    return getOutboxItem(userId, id)
  }, [])

  return {
    items: state.items,
    pendingCount: state.pendingCount,
    loading: state.loading,
    refresh,
    remove,
    save,
    getOne,
  }
}
