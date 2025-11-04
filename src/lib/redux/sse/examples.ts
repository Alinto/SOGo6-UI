/**
 * SSE Usage Examples
 * Copy these examples into your components
 */

// Example 1: Simple Connection Status
// src/components/sse-status.tsx
/*
'use client'

import { useAutoSSE, useSSEConnected } from '@/lib/redux/sse'

export function SSEStatus() {
  const isConnected = useSSEConnected()
  const { state, error } = useAutoSSE()

  return (
    <div className="flex items-center gap-2 p-2">
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className="text-sm">{state}</span>
      {error && <span className="text-red-600 text-xs">{error}</span>}
    </div>
  )
}
*/

// Example 2: Real-time Notifications
// src/components/notifications.tsx
/*
'use client'

import { useSSEData } from '@/lib/redux/sse'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'error' | 'warning'
}

export function Notifications() {
  const { data, loading, error } = useSSEData<Notification>('notifications')

  if (loading) {
    return <div className="p-4 text-gray-500">Connecting...</div>
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>
  }

  return (
    <div className="p-4">
      {data ? (
        <div className="flex gap-2 p-3 rounded bg-blue-100 text-blue-900">
          <span className="font-semibold">{data.title}</span>
          <span>{data.message}</span>
        </div>
      ) : (
        <div className="text-gray-500">No notifications</div>
      )}
    </div>
  )
}
*/

// Example 3: Chat with Multiple Event Types
// src/components/chat.tsx
/*
'use client'

import { useSSESubscription, useAutoSSE, useSSEConnected } from '@/lib/redux/sse'
import { useState } from 'react'

interface Message {
  id: string
  user: string
  text: string
  timestamp: string
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const isConnected = useSSEConnected()

  useAutoSSE()

  useSSESubscription<Message>('chat:message', (message) => {
    setMessages((prev) => [...prev, message])
  })

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 bg-gray-100 text-sm">
        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
          <div key={msg.id} className="border rounded p-2">
            <p className="font-semibold text-sm">{msg.user}</p>
            <p className="text-gray-800">{msg.text}</p>
            <p className="text-xs text-gray-500">{msg.timestamp}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
*/

// Example 4: Connection Stats Dashboard
// src/components/sse-dashboard.tsx
/*
'use client'

import { useSSEStats, useSSEConnected, useSSEError } from '@/lib/redux/sse'
import { useEffect, useState } from 'react'

export function SSEDashboard() {
  const stats = useSSEStats()
  const isConnected = useSSEConnected()
  const error = useSSEError()
  const [uptime, setUptime] = useState(0)

  useEffect(() => {
    if (!isConnected) return

    const interval = setInterval(() => {
      setUptime((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isConnected])

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}h ${minutes}m ${secs}s`
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <div className="p-3 border rounded">
        <p className="text-sm text-gray-600">Status</p>
        <p className="text-lg font-bold">{stats.state}</p>
      </div>
      
      <div className="p-3 border rounded">
        <p className="text-sm text-gray-600">Uptime</p>
        <p className="text-lg font-bold">{formatUptime(uptime)}</p>
      </div>
      
      <div className="p-3 border rounded">
        <p className="text-sm text-gray-600">Messages</p>
        <p className="text-lg font-bold">{stats.messageCount}</p>
      </div>
      
      <div className="p-3 border rounded">
        <p className="text-sm text-gray-600">Reconnects</p>
        <p className="text-lg font-bold">{stats.reconnectAttempts}</p>
      </div>

      {error && (
        <div className="col-span-2 p-3 bg-red-100 border border-red-300 rounded text-red-800">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error.message}</p>
        </div>
      )}

      <div className="col-span-2 p-3 bg-blue-100 border border-blue-300 rounded text-blue-800 text-sm">
        <p className="font-semibold mb-1">Connection Details</p>
        <p>State: {stats.state}</p>
        <p>
          Last Message:{' '}
          {stats.lastMessageTime
            ? new Date(stats.lastMessageTime).toLocaleTimeString()
            : 'Never'}
        </p>
      </div>
    </div>
  )
}
*/

// Example 5: Loading State with Skeleton
// src/components/real-time-data.tsx
/*
'use client'

import { useSSEData } from '@/lib/redux/sse'
import { Skeleton } from '@/components/ui/skeleton'

interface DataPoint {
  id: string
  label: string
  value: number
  unit: string
}

export function RealTimeData() {
  const { data, loading, error } = useSSEData<DataPoint>('data:update')

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-800 rounded">
        Failed to load data: {error}
      </div>
    )
  }

  if (!data) {
    return <div className="p-4 text-gray-500">No data available</div>
  }

  return (
    <div className="p-4 border rounded">
      <h3 className="font-semibold">{data.label}</h3>
      <p className="text-2xl font-bold">
        {data.value} <span className="text-sm text-gray-600">{data.unit}</span>
      </p>
    </div>
  )
}
*/

// Example 6: Manual Connection Control
// src/components/sse-controls.tsx
/*
'use client'

import { useSSE } from '@/lib/redux/sse'

export function SSEControls() {
  const { state, connect, disconnect, isConnected } = useSSE()

  return (
    <div className="flex gap-2 p-4">
      <button
        onClick={connect}
        disabled={isConnected}
        className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
      >
        Connect
      </button>
      
      <button
        onClick={disconnect}
        disabled={!isConnected}
        className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
      >
        Disconnect
      </button>
      
      <span className="flex items-center">
        Status: <strong className="ml-2">{state}</strong>
      </span>
    </div>
  )
}
*/

// Example 7: Combined Real-time List
// src/components/live-list.tsx
/*
'use client'

import { useSSESubscription, useAutoSSE } from '@/lib/redux/sse'
import { useState } from 'react'

interface Item {
  id: string
  name: string
  status: 'active' | 'inactive' | 'pending'
  updatedAt: string
}

export function LiveList() {
  const [items, setItems] = useState<Item[]>([])
  useAutoSSE()

  // Listen for item updates
  useSSESubscription<Item>('items:update', (item) => {
    setItems((prev) => {
      const index = prev.findIndex((i) => i.id === item.id)
      if (index >= 0) {
        const updated = [...prev]
        updated[index] = item
        return updated
      }
      return [...prev, item]
    })
  })

  // Listen for item deletions
  useSSESubscription<{ id: string }>('items:delete', ({ id }) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  })

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
  }

  return (
    <div className="space-y-2">
      {items.length === 0 ? (
        <p className="text-gray-500 p-4">No items</p>
      ) : (
        items.map((item) => (
          <div key={item.id} className="flex justify-between items-center p-3 border rounded">
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-xs text-gray-500">
                {new Date(item.updatedAt).toLocaleString()}
              </p>
            </div>
            <span className={`px-2 py-1 rounded text-sm ${statusColors[item.status]}`}>
              {item.status}
            </span>
          </div>
        ))
      )}
    </div>
  )
}
*/

// Examples are commented out above for reference
// Copy and adapt them into your own components
