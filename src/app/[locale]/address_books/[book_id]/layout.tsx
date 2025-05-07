import React from 'react'

export default function Layout({
  children,
  visualization,
}: {
  children: React.ReactNode
  visualization: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-full">
      <div className="flex flex-row gap-4">
        {children}
        <div className="md:flex md:flex-col hidden md:w-1/2 lg:w-3/5 md:p-4 md:rounded">
          {visualization}
        </div>
      </div>
    </div>
  )
}
