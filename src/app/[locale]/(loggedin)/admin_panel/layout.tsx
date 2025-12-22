import React from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col overflow-y-auto p-2">{children}</div>
  )
}
