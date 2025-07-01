import React from 'react'

export default async function Layout({
  children,
  visualization,
}: {
  children: React.ReactNode
  visualization: React.ReactNode
}) {
  return (
    <div className="bg-background/10 flex pl-2">
      {children}
      {visualization}
    </div>
  )
}
