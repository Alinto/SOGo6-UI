'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Mail, Pencil, Plus, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import {
  useDeleteImapAccountMutation,
  useGetImapAccountsListQuery,
} from '../store/imap-accounts-api'

interface ImapListViewProps {
  onEdit: (accountId: string) => void
  onAdd: () => void
}

function ImapListView({ onEdit, onAdd }: ImapListViewProps) {
  const t = useTranslations('US_MAIL_IMAP_ACCOUNTS')

  // State to manage which account is being deleted
  const [accountToDelete, setAccountToDelete] = useState<{
    id: string
    email: string
  } | null>(null)

  const { data: accounts, isLoading, error } = useGetImapAccountsListQuery()
  const [deleteAccount, { isLoading: isDeleting }] =
    useDeleteImapAccountMutation()

  // Confirm delete action
  const handleConfirmDelete = async () => {
    if (accountToDelete) {
      try {
        await deleteAccount(accountToDelete.id).unwrap()
        setAccountToDelete(null)
      } catch (error) {
        console.error('Failed to delete:', error)
      }
    }
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="border-destructive/50 bg-destructive/10 text-destructive rounded-lg border p-4 text-sm">
            {t('errors_api.load_failed.string')}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-9 w-32" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('list.title.string')}</CardTitle>
            <Button variant="outline" size="sm" onClick={onAdd}>
              <Plus className="mr-2 h-4 w-4" />
              {t('list.add_button.string')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {accounts && accounts.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              <Mail className="mx-auto mb-3 h-12 w-12 opacity-30" />
              <p className="text-sm">{t('list.empty.string')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {accounts?.map((account) => (
                <div
                  key={account.id}
                  className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="text-muted-foreground h-5 w-5" />
                    <div>
                      <p className="font-medium">{account.email}</p>
                      <p className="text-muted-foreground text-xs">
                        {t(`readReceipts.${account.readReceipts}.string`)}
                      </p>
                    </div>
                  </div>

                  {/* Actions : Edit & Delete */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground"
                      onClick={() => onEdit(account.id)}
                      aria-label={t('list.edit_button_aria.string', {
                        email: account.email,
                      })}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      onClick={() =>
                        setAccountToDelete({
                          id: account.id,
                          email: account.email,
                        })
                      }
                      aria-label={t('list.delete_button_aria.string', {
                        email: account.email,
                      })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation modal */}
      <AlertDialog
        open={!!accountToDelete}
        onOpenChange={(open) => !open && setAccountToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('list.delete_confirm_title.string')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {accountToDelete &&
                t('list.delete_confirm_desc.string', {
                  email: accountToDelete.email,
                })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t('list.cancel_button.string')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleConfirmDelete()
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? '...' : t('list.confirm_delete_button.string')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default ImapListView
