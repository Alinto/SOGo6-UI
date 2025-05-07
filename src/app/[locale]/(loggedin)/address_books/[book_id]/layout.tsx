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
      <div className="w-full md:w-1/2 md:rounded lg:w-2/5">{children}</div>
      <div className="hidden md:flex md:w-1/2 md:rounded lg:w-3/5">
        {visualization}
      </div>
    </div>
  )
}
