'use client'

import React from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="h-full w-full overflow-y-auto">{children}</div>
}
