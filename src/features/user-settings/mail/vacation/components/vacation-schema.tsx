import { z } from 'zod'
import { TIME_FORMAT_REGEX } from '../mail-vacation-constants'

type VacationTranslator = (
  key: string,
  values?: Record<string, string>
) => string

const weekdaysSchema = z.object({
  monday: z.boolean(),
  tuesday: z.boolean(),
  wednesday: z.boolean(),
  thursday: z.boolean(),
  friday: z.boolean(),
  saturday: z.boolean(),
  sunday: z.boolean(),
})

const dateRangeSchema = z
  .object({
    from: z.date().optional(),
    to: z.date().optional(),
  })
  .nullable()

export const createVacationSchema = (
  t: VacationTranslator,
  vacationAllowResponseAlways = false
) =>
  z
    .object({
      enabled: z.boolean(),
      customSubject: z.string(),
      autoReplyText: z.string(),
      constraints: z.object({
        enableDates: z.boolean(),
        dateRange: dateRangeSchema,
        enableHours: z.boolean(),
        startTime: z.string(),
        endTime: z.string(),
        weekdaysEnabled: z.boolean(),
        weekdays: weekdaysSchema,
        responseIntervalDays: z.number().int().nullable(),
      }),
      alwaysSend: z.boolean(),
    })
    .superRefine((values, ctx) => {
      if (!values.enabled) return

      if (!values.autoReplyText.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('errors.validation.message_required.string'),
          path: ['autoReplyText'],
        })
      }

      if (values.constraints.enableDates) {
        if (
          !values.constraints.dateRange?.from ||
          !values.constraints.dateRange?.to
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('errors.validation.dates_required.string'),
            path: ['constraints', 'dateRange'],
          })
        } else if (
          values.constraints.dateRange.from > values.constraints.dateRange.to
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('errors.validation.date_order.string'),
            path: ['constraints', 'dateRange'],
          })
        }
      }

      if (values.constraints.enableHours) {
        if (!TIME_FORMAT_REGEX.test(values.constraints.startTime)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('errors.validation.time_invalid.string'),
            path: ['constraints', 'startTime'],
          })
        }
        if (!TIME_FORMAT_REGEX.test(values.constraints.endTime)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('errors.validation.time_invalid.string'),
            path: ['constraints', 'endTime'],
          })
        }
      }

      if (values.constraints.weekdaysEnabled) {
        const hasDay = Object.values(values.constraints.weekdays).some(Boolean)
        if (!hasDay) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('errors.validation.weekday_required.string'),
            path: ['constraints', 'weekdays'],
          })
        }
      }

      const intervalDays = values.constraints.responseIntervalDays
      if (intervalDays !== null) {
        if (intervalDays < 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('errors.validation.response_interval_invalid.string'),
            path: ['constraints', 'responseIntervalDays'],
          })
        } else if (intervalDays === 0 && !vacationAllowResponseAlways) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('errors.validation.response_interval_zero.string'),
            path: ['constraints', 'responseIntervalDays'],
          })
        }
      }
    })

export type VacationFormValues = z.infer<
  ReturnType<typeof createVacationSchema>
>
