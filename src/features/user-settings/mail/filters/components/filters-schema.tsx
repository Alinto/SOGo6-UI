'use client'

import { useTranslations } from 'next-intl'
import { z } from 'zod'
import { FILTER_NAME_MAX_LENGTH } from '../mail-filters-constants'
import type { MailFilter } from '../mail-filters-types'

type FiltersTranslator = ReturnType<typeof useTranslations<'US_MAIL_FILTERS'>>

const emailSchema = z.string().email()

const createFilterRuleSchema = () =>
  z.object({
    id: z.string(),
    field: z.string().min(1),
    field_value: z.string().optional(),
    condition: z.string().min(1),
    value: z.string(),
  })

const createFilterActionSchema = (t: FiltersTranslator) =>
  z
    .object({
      id: z.string(),
      action: z.string().min(1),
      value: z.string(),
      createIfNotExist: z.boolean().optional(),
    })
    .superRefine((action, ctx) => {
      if (action.action === 'move' && !action.value.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('errors.validation.folder_required.string'),
          path: ['value'],
        })
      }
      if (action.action === 'forward') {
        const result = emailSchema.safeParse(action.value.trim())
        if (!result.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('errors.validation.email_invalid.string'),
            path: ['value'],
          })
        }
      }
      if (action.action === 'flag' || action.action === 'reject') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('errors.validation.action_unavailable.string'),
          path: ['action'],
        })
      }
    })

const createFilterItemSchema = (t: FiltersTranslator) =>
  z
    .object({
      id: z.string(),
      name: z
        .string()
        .trim()
        .min(1, t('errors.validation.name_required.string'))
        .max(FILTER_NAME_MAX_LENGTH),
      operator: z.enum(['AND', 'OR', 'ALL']),
      enabled: z.boolean(),
      rules: z.array(createFilterRuleSchema()),
      actions: z
        .array(createFilterActionSchema(t))
        .min(1, t('errors.validation.actions_required.string')),
      advancedStructure: z.boolean().optional(),
      readOnly: z.boolean().optional(),
    })
    .superRefine((filter, ctx) => {
      if (filter.operator !== 'ALL' && filter.rules.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('errors.validation.rules_required.string'),
          path: ['rules'],
        })
      }

      filter.rules.forEach((rule, index) => {
        if (rule.field === 'header' && !rule.field_value?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('errors.validation.header_name_required.string'),
            path: ['rules', index, 'field_value'],
          })
        }
        if (!rule.value.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('errors.validation.rule_value_required.string'),
            path: ['rules', index, 'value'],
          })
        }
      })
    })

export const createFiltersSchema = (t: FiltersTranslator) =>
  z.object({
    filters: z.array(createFilterItemSchema(t)),
  })

export const createSingleFilterSchema = (t: FiltersTranslator) =>
  createFilterItemSchema(t)

export type FiltersFormValues = z.infer<
  ReturnType<typeof createFiltersSchema>
>
export type SingleFilterFormValues = z.infer<
  ReturnType<typeof createSingleFilterSchema>
>

export type MailFilterFormValues = MailFilter
