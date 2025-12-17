'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2 } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

export type DictProps = {
  value?: Record<string, any> | null
  onChange: (v: Record<string, any>) => void
  disabled?: boolean
  name?: string
  itemName?: string
}

type Entry = {
  id: string
  keyName: string
  value: any
}

function buildObjectFromEntries(entries: Entry[]) {
  const obj: Record<string, any> = {}
  for (const e of entries) {
    // if key is empty, skip it (you can change this behaviour)
    if (!e.keyName) continue
    obj[e.keyName] = e.value
  }
  return obj
}

export default function Dict({
  value,
  onChange,
  disabled = false,
  name,
  itemName,
}: DictProps) {
  const idCounter = useRef(0)
  const [entries, setEntries] = useState<Entry[]>([])

  // Sync external value -> internal entries, preserving ids when possible
  useEffect(() => {
    const source =
      value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, any>)
        : {}

    setEntries((prev) => {
      const prevByKey = new Map(prev.map((p) => [p.keyName, p]))
      const next: Entry[] = []

      Object.entries(source).forEach(([k, v]) => {
        const existing = prevByKey.get(k)
        if (existing) {
          next.push({ ...existing, value: v })
          prevByKey.delete(k)
        } else {
          idCounter.current += 1
          next.push({ id: `dict-${idCounter.current}`, keyName: k, value: v })
        }
      })

      // if there were items in prev that no longer exist in source, we may keep them (optional).
      // To ensure user doesn't lose unsaved typed key when parent sends empty object,
      // also append remaining prev items that had empty keys or weren't in source:
      prev.forEach((p) => {
        if (
          !Object.prototype.hasOwnProperty.call(source, p.keyName) &&
          p.keyName === ''
        ) {
          // preserve in-progress empty key
          next.push(p)
        }
      })

      return next
    })
  }, [value])

  // Helper to emit changes to parent
  const emit = (nextEntries: Entry[]) => {
    setEntries(nextEntries)
    onChange(buildObjectFromEntries(nextEntries))
  }

  const handleKeyChange = (id: string, newKey: string) => {
    const next = entries.map((e) =>
      e.id === id ? { ...e, keyName: newKey } : e
    )
    emit(next)
  }

  const handleValueChange = (id: string, raw: string) => {
    let parsed: any = raw
    try {
      parsed = JSON.parse(raw)
    } catch {
      parsed = raw
    }
    const next = entries.map((e) => (e.id === id ? { ...e, value: parsed } : e))
    emit(next)
  }

  const handleRemove = (id: string) => {
    const next = entries.filter((e) => e.id !== id)
    emit(next)
  }

  const handleAdd = () => {
    // generate a unique key name that doesn't collide with existing keys
    const existingKeys = new Set(entries.map((e) => e.keyName))
    const base = 'key'
    let idx = 1
    let newKey = base
    while (existingKeys.has(newKey)) {
      newKey = `${base}_${idx++}`
    }
    idCounter.current += 1
    const newEntry: Entry = {
      id: `dict-${idCounter.current}`,
      keyName: newKey,
      value: '',
    }
    const next = [...entries, newEntry]
    emit(next)
  }

  return (
    <div className="w-full space-y-2">
      {entries.length === 0 && (
        <div className="text-muted-foreground text-sm">No entries</div>
      )}

      {entries.map((entry, i) => {
        return (
          <div key={entry.id} className="flex gap-2">
            <Input
              value={entry.keyName ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleKeyChange(entry.id, e.target.value)
              }
              placeholder="Key"
              type="text"
              disabled={disabled}
              aria-label={
                itemName ? `${itemName} key ${i + 1}` : `dict-key-${i}`
              }
            />
            <Input
              value={
                typeof entry.value === 'string'
                  ? entry.value
                  : JSON.stringify(entry.value ?? '', null, 0)
              }
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleValueChange(entry.id, e.target.value)
              }
              placeholder="Value (string or JSON)"
              type="text"
              disabled={disabled}
              aria-label={
                itemName ? `${itemName} value ${i + 1}` : `dict-value-${i}`
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemove(entry.id)}
              aria-label={`Remove ${itemName ?? name ?? 'entry'}`}
              disabled={disabled}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      })}

      <div>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={handleAdd}
          aria-label={`Add ${itemName ?? name ?? 'entry'}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md"
          disabled={disabled}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
