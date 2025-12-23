import React from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[calc(100vh-var(--header-height))] overflow-auto p-2">
      {children}
    </div>
  )
}
