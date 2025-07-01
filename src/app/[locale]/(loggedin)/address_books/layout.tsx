import React from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="h-full overflow-y-auto p-2">{children}</div>
}
