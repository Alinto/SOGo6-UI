'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  useGetFoldersQuery,
  useLazyGetFolderShareQuery,
  useSetFolderShareMutation,
} from '@/features/mails/store/mails-api'
import type { FolderShareRights, FolderShareUser } from '@/features/mails/mails-types'
import { UserPermissionsEditor } from '@/features/mails/components/sidebars/user-permissions-editor'
import { getActiveAdvancedCodes } from '@/features/mails/utils/permission-mapping'
import { useProfile } from '@/features/user-profile'
import { Loader2, Mail, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import type { GlobalAccessUserEntry } from '../store/access-api'
import { flattenMailFolders } from '../utils/owned-items'

interface AddFolderAccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: GlobalAccessUserEntry
}

const AddFolderAccessDialog: React.FC<AddFolderAccessDialogProps> = ({
  open,
  onOpenChange,
  entry,
}) => {
  const t = useTranslations('US_ACCESS')
  const { mainAccount } = useProfile()
  const accountId = mainAccount?.id ?? '0'

  const { data: folders, isLoading } = useGetFoldersQuery(
    { accountId },
    { skip: !open }
  )
  const [setFolderShare] = useSetFolderShareMutation()
  const [fetchFolderShare] = useLazyGetFolderShareQuery()

  const [selectedPaths, setSelectedPaths] = React.useState<Set<string>>(new Set())
  const [rights, setRights] = React.useState<FolderShareRights>({})
  const [applyToSubfolders, setApplyToSubfolders] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)

  const sharedPaths = React.useMemo(
    () =>
      new Set(
        entry.grants
          .filter((grant) => grant.domain === 'mail')
          .map((grant) => grant.itemKey)
      ),
    [entry.grants]
  )

  const allFolders = React.useMemo(
    () => flattenMailFolders(folders ?? []),
    [folders]
  )
  const available = React.useMemo(
    () => allFolders.filter((folder) => !sharedPaths.has(folder.path)),
    [allFolders, sharedPaths]
  )

  React.useEffect(() => {
    if (!open) {
      setSelectedPaths(new Set())
      setRights({})
      setApplyToSubfolders(false)
      setIsSaving(false)
    }
  }, [open])

  const toggleFolder = (path: string): void => {
    setSelectedPaths((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  const handleSave = async (): Promise<void> => {
    if (selectedPaths.size === 0) return

    setIsSaving(true)
    try {
      const newUser: FolderShareUser = {
        uid: entry.uid,
        c_email: entry.c_email,
        userClass: 'normal-user',
        rights,
        permissions: getActiveAdvancedCodes(rights),
        applyToSubfolders,
      }

      await Promise.all(
        Array.from(selectedPaths).map(async (folderPath) => {
          const shareData = await fetchFolderShare({
            accountId,
            folderPath,
          }).unwrap()
          const existing = Object.values(shareData.users).filter(
            (u) => u.uid !== entry.uid
          )
          await setFolderShare({
            accountId,
            folderPath,
            users: [...existing, newUser],
          }).unwrap()
        })
      )
      onOpenChange(false)
    } catch {
      // Error surfaced by each mutation's own notification handler.
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex min-h-125 max-h-[90vh] max-w-[calc(100vw-2rem)] flex-col overflow-hidden sm:max-w-2xl">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-4 w-4 shrink-0" />
            {t('addAccess.folder.title.string')}
          </DialogTitle>
          <DialogDescription>
            {t('addAccess.folder.description.string', {
              user: entry.c_email ?? entry.uid,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4">
          <div className="shrink-0 space-y-2">
            <p className="text-sm font-medium">{t('addAccess.itemsLabel.string')}</p>
            <ScrollArea className="h-40 rounded-md border p-2">
              {isLoading ? (
                <div className="py-4 text-center">
                  <Loader2 className="text-muted-foreground mx-auto h-5 w-5 animate-spin" />
                </div>
              ) : available.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
                  <Users className="text-muted-foreground h-8 w-8" />
                  <p className="text-muted-foreground text-sm">
                    {t(
                      allFolders.length === 0
                        ? 'addAccess.noItems.string'
                        : 'addAccess.allShared.string'
                    )}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {available.map((folder) => (
                    <label
                      key={folder.path}
                      className="flex items-center gap-2.5 rounded px-1 py-1.5 text-sm"
                    >
                      <Checkbox
                        checked={selectedPaths.has(folder.path)}
                        onCheckedChange={() => toggleFolder(folder.path)}
                      />
                      <span className="truncate">{folder.path}</span>
                    </label>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <Separator />

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <UserPermissionsEditor
              rights={rights}
              onChange={(next) => setRights(next.rights)}
              applyToSubfolders={applyToSubfolders}
              onApplyToSubfoldersChange={setApplyToSubfolders}
            />
          </div>
        </div>

        <DialogFooter className="mt-4 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            {t('addAccess.cancel.string')}
          </Button>
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving || selectedPaths.size === 0}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t('addAccess.confirm.string')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AddFolderAccessDialog
