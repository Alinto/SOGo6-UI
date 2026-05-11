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
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCreateFolderMutation } from '../../store/mails-api'

const createFolderSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'required' })
    .max(100, { message: 'max' })
    .refine((v) => !v.includes('.'), {
      message: 'dot',
    }),
})

type CreateFolderFormValues = z.infer<typeof createFolderSchema>

export interface CreateFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: string
  parentPath: string
}

function CreateFolderNameFieldMessage() {
  const { error, formMessageId } = useFormField()
  const t = useTranslations('MAILS_COMMONS')

  if (!error?.message) {
    return null
  }

  const text =
    error.message === 'required'
      ? t('folders.actions.new_subfolder_dialog.error_required.string')
      : error.message === 'dot'
        ? t('folders.actions.new_subfolder_dialog.error_dot.string')
        : error.message === 'max'
          ? t('folders.actions.new_subfolder_dialog.error_max.string')
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

export function CreateFolderDialog({
  open,
  onOpenChange,
  accountId,
  parentPath,
}: CreateFolderDialogProps) {
  const t = useTranslations('MAILS_COMMONS')
  const [createFolder, { isLoading }] = useCreateFolderMutation()

  const form = useForm<CreateFolderFormValues>({
    resolver: zodResolver(createFolderSchema),
    defaultValues: { name: '' },
    mode: 'onChange',
  })

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      form.reset()
    }
    onOpenChange(next)
  }

  const handleSubmit = async (values: CreateFolderFormValues) => {
    try {
      await createFolder({
        accountId,
        body: {
          name: values.name.trim(),
          parent: parentPath,
        },
      }).unwrap()
      form.reset()
      handleOpenChange(false)
    } catch {
      // Error already handled by createApiNotificationHandler
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md">
        <Form {...form}>
          <form
            id="create-folder-form"
            className="space-y-4"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t('folders.actions.new_subfolder_dialog.title.string')}
              </AlertDialogTitle>
              <AlertDialogDescription className="sr-only">
                {t('folders.actions.new_subfolder_dialog.label.string')}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('folders.actions.new_subfolder_dialog.label.string')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoFocus
                      disabled={isLoading}
                      placeholder={t(
                        'folders.actions.new_subfolder_dialog.placeholder.string'
                      )}
                      autoComplete="off"
                    />
                  </FormControl>
                  <CreateFolderNameFieldMessage />
                </FormItem>
              )}
            />

            <AlertDialogFooter>
              <AlertDialogCancel type="button" disabled={isLoading}>
                {t('folders.actions.new_subfolder_dialog.cancel.string')}
              </AlertDialogCancel>
              <Button
                type="submit"
                form="create-folder-form"
                disabled={isLoading || !form.formState.isValid}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t('folders.actions.new_subfolder_dialog.submit.string')
                )}
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
