import Draggable from '@/components/dnd/draggable'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  clearSelectedMails,
  setSelectedMails,
} from '@/features/mails/store/mail-layout-slice'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import type { RootState } from '@/lib/redux/store'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import React, { useCallback, useEffect, useMemo } from 'react'
import type { ImapFolder, ImapMessagesList } from '../mails-types'
import {
  useGetFoldersQuery,
  useMailActionMutation,
  useMoveToTrashMutation,
} from '../store/mails-api'
import ListItem from './list-item'
import ListItemClassic from './list-item-classic'
import AddressBookListSkeleton from './skeletons/skeleton'

/**
 * Repli si aucun dossier nommé « Archive » n’est trouvé dans l’arbre renvoyé par getFolders.
 * TODO: relier au chemin d’archive des préférences utilisateur / backend quand disponible.
 */
const ARCHIVE_FOLDER = 'Archive'

function findArchiveFolderPath(folders: ImapFolder[] | undefined): string | null {
  if (!folders?.length) return null
  for (const node of folders) {
    if (node.name.toLowerCase() === 'archive') {
      return node.path
    }
    const nested = node.subfolders ?? node.children ?? []
    const found = findArchiveFolderPath(nested)
    if (found) return found
  }
  return null
}

interface MessagesListProps {
  items: ImapMessagesList[]
  // TODO: implement pagination UI — passed from folder pages, not consumed here yet
  total?: number
  page?: number
  totalPages?: number
  hasNextPage?: boolean
  hasPreviousPage?: boolean
  isLoading: boolean
  isFetching?: boolean
  type?: 'classic' | 'modern'
  hideToolbar?: boolean
}

const MessagesList: React.FC<MessagesListProps> = ({
  items,
  isLoading,
  isFetching = false,
  type,
  hideToolbar = false,
}) => {
  const t = useTranslations('MAILS_LIST')
  const isMobile = useIsMobile()
  const dispatch = useAppDispatch()
  const { folder, account } = useParams()
  const accountIdStr = (Array.isArray(account) ? account[0] : account) ?? '0'
  const folderStr =
    typeof folder === 'string'
      ? folder
      : Array.isArray(folder)
        ? folder.join('/')
        : ''

  const { data: foldersData } = useGetFoldersQuery({
    accountId: accountIdStr,
  })
  const archiveDestination = useMemo(
    () => findArchiveFolderPath(foldersData) ?? ARCHIVE_FOLDER,
    [foldersData]
  )

  const [mailAction] = useMailActionMutation()
  const [moveToTrash] = useMoveToTrashMutation()

  const handleToggleRead = useCallback(
    (id: string) => {
      const item = items.find((m) => String(m.id) === String(id))
      if (!item) return
      mailAction({
        accountId: accountIdStr,
        folder: folderStr,
        mailId: id,
        action: item.seen ? 'untag' : 'tag',
        data: ['\\Seen'],
      })
    },
    [items, accountIdStr, folderStr, mailAction]
  )

  const handleDelete = useCallback(
    (id: string) => {
      moveToTrash({
        accountId: accountIdStr,
        folder: folderStr,
        mailId: id,
      })
    },
    [moveToTrash, accountIdStr, folderStr]
  )

  const handleArchive = useCallback(
    (id: string) => {
      mailAction({
        accountId: accountIdStr,
        folder: folderStr,
        mailId: id,
        action: 'move',
        data: archiveDestination,
      })
    },
    [mailAction, accountIdStr, folderStr, archiveDestination]
  )

  const selectedIds = useAppSelector(
    (state: RootState) => state.mailLayout.selectedMailIds
  )

  // Reset selection when folder changes
  useEffect(() => {
    dispatch(clearSelectedMails())
  }, [folderStr, dispatch])

  const handleCheckboxClick = (e: React.MouseEvent, item: ImapMessagesList) => {
    e.stopPropagation()
    const id = String(item.id)
    const next = selectedIds.includes(id)
      ? selectedIds.filter((i) => i !== id)
      : [...selectedIds, id]
    dispatch(setSelectedMails(next))
  }

  if (isLoading) {
    return <AddressBookListSkeleton />
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex min-h-0 w-full flex-1 flex-col rounded overflow-hidden">
        {!hideToolbar && (
          <div className="text-foreground flex min-w-0 shrink-0 flex-row flex-wrap items-center justify-between gap-y-1">
            <span className="text-muted-foreground hidden text-sm md:inline-block" />
          </div>
        )}
        <ul className={cn('min-h-0 flex-1 overflow-y-auto rounded transition-opacity', isMobile && 'pb-12', isFetching && 'opacity-60')}>
          {items.length === 0 && (
            <li className="text-foreground mt-3 flex h-14 items-center justify-center rounded-full text-center">
              {t('no_items.string')}
            </li>
          )}
          {items.length > 0 &&
            items.map((item) => {
              const listItemComponent =
                type === 'classic' ? (
                  <ListItemClassic
                    data={item}
                    onHandleCheckboxClick={handleCheckboxClick}
                    isSelected={selectedIds.includes(String(item.id))}
                    onToggleRead={handleToggleRead}
                  />
                ) : (
                  <ListItem
                    data={item}
                    onHandleCheckboxClick={handleCheckboxClick}
                    isSelected={selectedIds.includes(String(item.id))}
                    onToggleRead={handleToggleRead}
                    onDelete={handleDelete}
                    onArchive={handleArchive}
                  />
                )
              return (
                <li key={item.id}>
                  {isMobile ? (
                    listItemComponent
                  ) : (
                    <Draggable id={item.id}>{listItemComponent}</Draggable>
                  )}
                </li>
              )
            })}
        </ul>
      </div>
    </TooltipProvider>
  )
}

export default MessagesList
