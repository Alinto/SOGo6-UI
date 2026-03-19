'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { format, subMonths, subYears } from 'date-fns'
import { useTranslations } from 'next-intl'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar-core'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePurgeFolderMutation } from '../../store/mails-api'

// --- Zod schema ---
const purgeFolderSchema = z
  .object({
    datePreset: z.enum(['3months', '6months', '1year', 'custom', 'all']),
    customDate: z.date().optional(),
    applyToSubfolders: z.boolean(),
    permanentlyDelete: z.boolean(),
    confirmPermanent: z.boolean(),
  })
  .refine(
    (data) => !data.permanentlyDelete || data.confirmPermanent,
    {
      message: 'You must confirm permanent deletion',
      path: ['confirmPermanent'],
    }
  )
  .refine(
    (data) => data.datePreset !== 'custom' || !!data.customDate,
    {
      message: 'Please select a date',
      path: ['customDate'],
    }
  )

type PurgeFolderFormValues = z.infer<typeof purgeFolderSchema>

// --- Props ---
interface PurgeFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: string
  folderPath: string
  folderName: string
  hasSubfolders: boolean
}

// --- Date presets ---
const DATE_PRESETS = [
  '3months',
  '6months',
  '1year',
  'custom',
  'all',
] as const

function getDatePresetLabel(
  value: (typeof DATE_PRESETS)[number],
  t: (key: string) => string
): string {
  switch (value) {
    case '3months':
      return t('folders.actions.purge.datePresets.3months.string')
    case '6months':
      return t('folders.actions.purge.datePresets.6months.string')
    case '1year':
      return t('folders.actions.purge.datePresets.1year.string')
    case 'custom':
      return t('folders.actions.purge.datePresets.custom.string')
    case 'all':
      return t('folders.actions.purge.datePresets.all.string')
    default:
      return value
  }
}

const getDateFromPreset = (
  preset: string,
  customDate?: Date
): string | undefined => {
  const today = new Date()
  switch (preset) {
    case '3months':
      return format(subMonths(today, 3), 'yyyy-MM-dd')
    case '6months':
      return format(subMonths(today, 6), 'yyyy-MM-dd')
    case '1year':
      return format(subYears(today, 1), 'yyyy-MM-dd')
    case 'custom':
      return customDate ? format(customDate, 'yyyy-MM-dd') : undefined
    case 'all':
      return undefined
    default:
      return undefined
  }
}

// --- Component ---
export function PurgeFolderDialog({
  open,
  onOpenChange,
  accountId,
  folderPath,
  folderName,
  hasSubfolders,
}: PurgeFolderDialogProps) {
  const t = useTranslations('MAILS_COMMONS')
  const [purgeFolder, { isLoading }] = usePurgeFolderMutation()

  const form = useForm<PurgeFolderFormValues>({
    resolver: zodResolver(purgeFolderSchema),
    defaultValues: {
      datePreset: '3months',
      customDate: undefined,
      applyToSubfolders: false,
      permanentlyDelete: false,
      confirmPermanent: false,
    },
  })

  const datePreset = form.watch('datePreset')
  const permanentlyDelete = form.watch('permanentlyDelete')

  const handleSubmit = async (values: PurgeFolderFormValues) => {
    try {
      const date = getDateFromPreset(values.datePreset, values.customDate)
      await purgeFolder({
        accountId,
        folderPath,
        date,
        applyToSubfolders: values.applyToSubfolders,
        permanentlyDelete: values.permanentlyDelete,
      }).unwrap()
      form.reset()
      onOpenChange(false)
    } catch {
      // Error already handled by createApiNotificationHandler
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) form.reset()
    onOpenChange(open)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('folders.actions.purge.confirmTitle.string')} — {folderName}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('folders.actions.purge.confirmDesc.string', {
              folder: folderName,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Form {...form}>
          <form className="space-y-4">
            {/* Date preset selector */}
            <FormField
              control={form.control}
              name="datePreset"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('folders.actions.purge.olderThan.string')}
                  </FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {DATE_PRESETS.map((presetValue) => (
                      <Button
                        key={presetValue}
                        type="button"
                        variant={
                          field.value === presetValue ? 'default' : 'outline'
                        }
                        size="sm"
                        onClick={() => field.onChange(presetValue)}
                      >
                        {getDatePresetLabel(presetValue, t)}
                      </Button>
                    ))}
                  </div>
                </FormItem>
              )}
            />

            {/* Custom date picker — shown only when preset === 'custom' */}
            {datePreset === 'custom' && (
              <FormField
                control={form.control}
                name="customDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>
                      {t('folders.actions.purge.customDate.string')}
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value
                              ? format(field.value, 'PPP')
                              : t('folders.actions.purge.pickDate.string')}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
            )}

            {/* Apply to subfolders — only shown if folder has subfolders */}
            {hasSubfolders && (
              <FormField
                control={form.control}
                name="applyToSubfolders"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer font-normal">
                      {t('folders.actions.purge.applyToSubfolders.string')}
                    </FormLabel>
                  </FormItem>
                )}
              />
            )}

            {/* Permanently delete */}
            <FormField
              control={form.control}
              name="permanentlyDelete"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked)
                        if (!checked) {
                          form.setValue('confirmPermanent', false)
                        }
                      }}
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer font-normal">
                    {t('folders.actions.purge.permanentlyDelete.string')}
                  </FormLabel>
                </FormItem>
              )}
            />

            {/* Confirm permanent delete — second checkbox, shown only if permanentlyDelete is checked */}
            {permanentlyDelete && (
              <FormField
                control={form.control}
                name="confirmPermanent"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0 rounded-md border border-destructive p-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-destructive"
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer font-normal text-destructive">
                      {t(
                        'folders.actions.purge.confirmPermanent.string'
                      )}
                    </FormLabel>
                  </FormItem>
                )}
              />
            )}

            <AlertDialogFooter>
              <AlertDialogCancel type="button" disabled={isLoading}>
                {t('folders.actions.purge.cancel.string')}
              </AlertDialogCancel>

              <Button
                type="button"
                formNoValidate
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isLoading || !form.formState.isValid}
                onClick={() => form.handleSubmit(handleSubmit)()}
              >
                {isLoading ? '...' : t('folders.actions.purge.confirm.string')}
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
