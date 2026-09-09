'use client'

import { Badge } from '@/components/ui/badge'
import { iconSelectorByType } from '@/features/mails/components/utils'
import type { ImapFolderType } from '@/features/mails/mails-types'
import { DynamicIcon } from 'lucide-react/dynamic'

export type MailFolderLabelProps = {
  name: string
  type?: ImapFolderType
}

export default function MailFolderLabel({ name, type }: MailFolderLabelProps) {
  return (
    <Badge
      variant="outline"
      className="text-muted-foreground shrink-0 gap-1 rounded-full px-1.5 py-0 text-xs font-normal"
    >
      <DynamicIcon name={iconSelectorByType(type)} className="h-3 w-3" />
      {name}
    </Badge>
  )
}
