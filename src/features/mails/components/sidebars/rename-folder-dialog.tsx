'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  useFormField,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { setSkipFolderFetch } from '@/features/mails/store/mail-navigation-slice'
import { useRouter } from '@/lib/i18n/navigation'
import { useAppDispatch } from '@/lib/redux/hooks'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import { useRenameFolderMutation } from '../../store/mails-api'

const renameFolderSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'required' })
    .max(100, { message: 'max' })
    .refine((v) => !v.includes('.'), {
      message: 'dot',
    }),
})

type RenameFolderFormValues = z.infer<typeof renameFolderSchema>

export interface RenameFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: string
  folderPath: string
  folderName: string
  folderDelimiter: string
}

function RenameFolderNameFieldMessage() {
  const { error, formMessageId } = useFormField()
  const t = useTranslations('MAILS_COMMONS')

  if (!error?.message) {
    return null
  }

  const text =
    error.message === 'required'
      ? t('folders.actions.rename_dialog.error_required.string')
      : error.message === 'dot'
        ? t('folders.actions.rename_dialog.error_dot.string')
        : error.message === 'max'
          ? t('folders.actions.rename_dialog.error_max.string')
          : error.message

  return (
    <p
      id={formMessageId}
      className="text-[0.8rem] font-medium text-destructive"
      role="alert"
    >
      {text}
    </p>
  )
}

export function RenameFolderDialog({
  open,
  onOpenChange,
  accountId,
  folderPath,
  folderName,
  folderDelimiter,
}: RenameFolderDialogProps) {
  const t = useTranslations('MAILS_COMMONS')
  const dispatch = useAppDispatch()
  const { push } = useRouter()
  const { account, folder } = useParams()
  const [renameFolder, { isLoading }] = useRenameFolderMutation()

  const form = useForm<RenameFolderFormValues>({
    resolver: zodResolver(renameFolderSchema),
    defaultValues: { name: folderName },
    mode: 'onChange',
  })

  useEffect(() => {
    if (open) {
      form.reset({ name: folderName })
    }
  }, [open, folderName, form])

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      form.reset({ name: folderName })
    }
    onOpenChange(next)
  }

  const handleSubmit = async (values: RenameFolderFormValues) => {
    const trimmedName = values.name.trim()
    if (trimmedName === folderName) {
      handleOpenChange(false)
      return
    }

    const parts = folderPath.split(folderDelimiter)
    parts[parts.length - 1] = trimmedName
    const newFolderPath = parts.join(folderDelimiter)

    const currentFolder = Array.isArray(folder)
      ? folder.join('/')
      : typeof folder === 'string'
        ? folder
        : ''
    const isViewingRenamedOrDescendant =
      !!currentFolder &&
      (currentFolder === folderPath ||
        currentFolder.startsWith(`${folderPath}${folderDelimiter}`))

    try {
      if (isViewingRenamedOrDescendant) {
        dispatch(setSkipFolderFetch(true))
      }

      await renameFolder({
        accountId,
        folderPath,
        body: { name: trimmedName },
      }).unwrap()

      if (isViewingRenamedOrDescendant) {
        const acc = String(account ?? accountId)
        const suffix = currentFolder.slice(folderPath.length)
        push(`/u/${acc}/${encodeURIComponent(newFolderPath + suffix)}`)
      }

      handleOpenChange(false)
    } catch {
      dispatch(setSkipFolderFetch(false))
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md">
        <Form {...form}>
          <form
            id="rename-folder-form"
            className="space-y-4"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t('folders.actions.rename_dialog.title.string')}
              </AlertDialogTitle>
              <AlertDialogDescription className="sr-only">
                {t('folders.actions.rename_dialog.label.string')}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('folders.actions.rename_dialog.label.string')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoFocus
                      disabled={isLoading}
                      placeholder={t(
                        'folders.actions.rename_dialog.placeholder.string'
                      )}
                      autoComplete="off"
                    />
                  </FormControl>
                  <RenameFolderNameFieldMessage />
                </FormItem>
              )}
            />

            <AlertDialogFooter>
              <AlertDialogCancel type="button" disabled={isLoading}>
                {t('folders.actions.rename_dialog.cancel.string')}
              </AlertDialogCancel>
              <Button
                type="submit"
                form="rename-folder-form"
                disabled={isLoading || !form.formState.isValid}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t('folders.actions.rename_dialog.submit.string')
                )}
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
