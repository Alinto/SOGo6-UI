import React from 'react'

export default function Layout({
  children,
  visualization,
}: {
  children: React.ReactNode
  visualization: React.ReactNode
}) {
  return (
    <div className="flex min-h-full">
      <div className="border-muted h-[calc(100vh-var(--header-height))] w-full overflow-y-auto border-r md:w-1/2 md:rounded lg:w-2/5">
        {children}
      </div>
      <div className="hidden h-[calc(100vh-var(--header-height)-8px)] overflow-y-auto p-1 md:flex md:w-1/2 md:rounded lg:w-3/5">
        {visualization}
      </div>
    </div>
  )
}
