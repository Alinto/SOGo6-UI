'use client'
import { z, ZodArray, ZodObject, ZodType } from 'zod'
import { AddressBook } from '../address-books-types'

type AddressBookSchema = ZodObject<{
  books: ZodArray<
    ZodObject<{
      [K in keyof Partial<AddressBook>]: K extends keyof AddressBook
        ? ZodType<AddressBook[K]>
        : never
    }>
  >
}>

const schema = z.object({
  books: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
    })
  ),
}) satisfies AddressBookSchema

export { schema }
