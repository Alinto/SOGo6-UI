import { useIsMobile } from '@/hooks/use-mobile'
import React, { memo } from 'react'
import { ImapMessagesList } from '../mails-types'
import ListItemDesktop from './list-item-desktop'
import ListItemMobile from './list-item-mobile'

interface ListItemProps {
  data: ImapMessagesList
  isSelected: boolean
  onHandleCheckboxClick: (_e: React.MouseEvent, _item: ImapMessagesList) => void
  onToggleRead?: (id: string) => void
  onToggleFlag?: (id: string) => void
  onDelete?: (id: string) => void
  onArchive?: (id: string) => void
  onSpam?: (id: string) => void
  onMoveToInbox?: (id: string) => void
}

const ListItem: React.FC<ListItemProps> = (props) => {
  const isMobile = useIsMobile()

  return isMobile ? (
    <ListItemMobile {...props} />
  ) : (
    <ListItemDesktop {...props} />
  )
}

export default memo(ListItem)
