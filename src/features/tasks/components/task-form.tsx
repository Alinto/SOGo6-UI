'use client'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import type { Calendar } from '@/features/calendars/calendars-types'
import type { Task, TaskCreateBody } from '@/features/tasks/tasks-types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { memo, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const taskStatuses = [
  'needs_action',
  'in_process',
  'completed',
  'cancelled',
] as const

const taskFormSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(5000).optional().nullable(),
  calendar_key: z.string().min(1),
  due: z.string().optional().nullable(),
  date_start: z.string().optional().nullable(),
  status: z.enum(taskStatuses).default('needs_action'),
  priority: z.number().min(0).max(9).default(0),
  percent_complete: z.number().min(0).max(100).optional().nullable(),
  visibility: z
    .enum(['public', 'private', 'confidential'])
    .optional()
    .nullable(),
})

type TaskFormValues = z.infer<typeof taskFormSchema>

type TaskFormProps = {
  open: boolean
  calendars: Calendar[]
  task?: Task | null
  defaultCalendarKey?: string | null
  onClose: () => void
  onSubmit: (values: {
    calendarKey: string
    body: TaskCreateBody
    taskKey?: string
  }) => Promise<void>
}

function toDatetimeLocal(iso?: string | null): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch {
    return ''
  }
}

function fromDatetimeLocal(value: string): string | null {
  if (!value) return null
  return new Date(value).toISOString()
}

function TaskForm({
  open,
  calendars,
  task,
  defaultCalendarKey,
  onClose,
  onSubmit,
}: TaskFormProps) {
  const t = useTranslations('TASKS')
  const isEdit = Boolean(task?.key ?? task?.id)

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      calendar_key: defaultCalendarKey ?? calendars[0]?.key ?? calendars[0]?.id ?? '',
      due: '',
      date_start: '',
      status: 'needs_action',
      priority: 0,
      percent_complete: 0,
      visibility: 'public',
    },
  })

  useEffect(() => {
    if (!open) return
    if (task) {
      form.reset({
        title: task.title,
        description: task.description ?? '',
        calendar_key:
          task.calendar_key ??
          task.calendar_id ??
          defaultCalendarKey ??
          '',
        due: toDatetimeLocal(task.due),
        date_start: toDatetimeLocal(task.date_start),
        status: task.status ?? 'needs_action',
        priority: task.priority ?? 0,
        percent_complete: task.percent_complete ?? 0,
        visibility: task.visibility ?? 'public',
      })
    } else {
      form.reset({
        title: '',
        description: '',
        calendar_key:
          defaultCalendarKey ??
          calendars[0]?.key ??
          calendars[0]?.id ??
          '',
        due: '',
        date_start: '',
        status: 'needs_action',
        priority: 0,
        percent_complete: 0,
        visibility: 'public',
      })
    }
  }, [open, task, calendars, defaultCalendarKey, form])

  const status = form.watch('status')

  const handleSubmit = form.handleSubmit(async (values) => {
    const body: TaskCreateBody = {
      title: values.title,
      description: values.description || null,
      due: fromDatetimeLocal(values.due ?? ''),
      date_start: fromDatetimeLocal(values.date_start ?? ''),
      status: values.status,
      priority: values.priority,
      percent_complete: values.percent_complete ?? null,
      visibility: values.visibility ?? null,
      completed_at:
        values.status === 'completed' ? new Date().toISOString() : null,
    }

    await onSubmit({
      calendarKey: values.calendar_key,
      body,
      taskKey: task?.key ?? task?.id ?? undefined,
    })
    onClose()
  })

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {isEdit ? t('form.edit_title.string') : t('form.create_title.string')}
          </SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-4"
            data-testid="task-form"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.title.string')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="calendar_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.calendar.string')}</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isEdit}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {calendars.map((cal) => {
                        const key = cal.key ?? cal.id ?? ''
                        return (
                          <SelectItem key={key} value={key}>
                            {cal.name}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="due"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.due.string')}</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} value={field.value ?? ''} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date_start"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.date_start.string')}</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} value={field.value ?? ''} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.status.string')}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {taskStatuses.map((s) => (
                        <SelectItem key={s} value={s}>
                          {t(`status.${s}.string`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.priority.string')}</FormLabel>
                  <Select
                    value={String(field.value)}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">{t('priority.none.string')}</SelectItem>
                      <SelectItem value="1">{t('priority.high.string')}</SelectItem>
                      <SelectItem value="5">{t('priority.medium.string')}</SelectItem>
                      <SelectItem value="9">{t('priority.low.string')}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {status === 'in_process' && (
              <FormField
                control={form.control}
                name="percent_complete"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('form.percent_complete.string')}: {field.value ?? 0}%
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step={5}
                        value={field.value ?? 0}
                        onChange={(e) =>
                          field.onChange(
                            Math.min(
                              100,
                              Math.max(0, Number(e.target.value) || 0)
                            )
                          )
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.description.string')}</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value ?? ''} rows={4} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                {t('form.cancel.string')}
              </Button>
              <Button type="submit">{t('form.save.string')}</Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

export default memo(TaskForm)
