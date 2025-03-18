'use client'
import { z } from 'zod'

const schema = z.object({
  enabled: z.boolean(),
  id: z.string(),
  name: z.string(),
  operator: z.string(),
  rules: z.array(
    z
      .object({
        id: z.string(),
        field: z.string(),
        field_value: z.string(),
        condition: z.string(),
        value: z.string(),
      })
      .optional()
  ),
  actions: z.array(
    z.object({
      id: z.string(),
      action: z.string(),
      value: z.string(),
    })
  ),
})

const defaultValues = {
  name: '',
  operator: 'AND',
  enabled: true,
  rules: [
    {
      field: '',
      condition: '',
      value: '',
    },
  ],
  actions: [
    {
      id: '',
      action: '',
      value: '',
    },
  ],
}

export { defaultValues, schema }
