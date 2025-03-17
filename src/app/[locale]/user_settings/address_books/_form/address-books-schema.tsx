'use client'
import { z } from 'zod'

const schema = z.object({
  books: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
    })
  ),
})

const defaultValues = {
  books: [
    {
      id: '1',
      label: 'Personnal',
    },
    {
      id: '2',
      label: 'Pro',
    },
    {
      id: '3',
      label: 'Friends',
    },
    {
      id: '4',
      label: 'Never call again',
    },
  ],
}

export { defaultValues, schema }
