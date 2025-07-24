import React from 'react'

type Action = {
  icon: React.ReactNode
  title?: string
}

export type MailActionsBarProps = {
  actions: Action[]
  className?: string
  onAction?: (idx: number, action: Action) => void
}

export type MailReturnButtonProps = {
  folderPath: string
  tooltip?: string
  className?: string
}
