import React from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="overflow-y-auto p-2">{children}</div>
}
