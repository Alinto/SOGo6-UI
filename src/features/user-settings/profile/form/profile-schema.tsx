'use client'
import { z } from 'zod'

const schema = z.object({
  firstname: z.string(),
  lastname: z.string(),
})

const defaultValues = {
  firstname: 'Henry',
  lastname: 'Dupont',
}

export { defaultValues, schema }
