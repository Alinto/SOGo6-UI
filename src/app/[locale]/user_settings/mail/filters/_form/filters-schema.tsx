'use client'
import { z } from 'zod'

const schema = z.object({
  filters: z.array(
    z.object({
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
  ),
})

const defaultValues = {
  filters: [
    {
      id: '1',
      name: 'Filter 1',
      operator: 'AND',
      enabled: true,
      rules: [
        {
          id: '1',
          field: 'from',
          condition: 'contains',
          value: 'alinto.eu',
        },
      ],
      actions: [
        {
          id: '1',
          action: 'move',
          value: 'inbox',
        },
      ],
    },
    {
      id: '2',
      name: 'Filter 2',
      operator: 'AND',
      enabled: true,
      rules: [
        {
          id: '1',
          field: 'header',
          field_value: 'X-Alinto-User',
          condition: 'contains',
          value: 'alinto.eu',
        },
      ],
      actions: [
        {
          id: '1',
          action: 'move',
          value: 'inbox',
        },
      ],
    },
    {
      id: '3',
      name: 'Filter 3',
      operator: 'AND',
      enabled: false,
      rules: [
        {
          id: '1',
          field: 'from',
          condition: 'contains',
          value: 'example.com',
        },
      ],
      actions: [
        {
          id: '1',
          action: 'move',
          value: 'inbox',
        },
      ],
    },
    {
      id: '4',
      name: 'Filter 4',
      operator: 'AND',
      enabled: true,
      rules: [
        {
          id: '1',
          field: 'from',
          condition: 'contains',
          value: 'example.com',
        },
      ],
      actions: [
        {
          id: '1',
          action: 'move',
          value: 'inbox',
        },
      ],
    },
  ],
}

export { defaultValues, schema }
