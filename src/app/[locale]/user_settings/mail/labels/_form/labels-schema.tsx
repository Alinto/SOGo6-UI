'use client'
import { z } from 'zod'

const schema = z.object({
  labels: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      IMAPLabel: z.string(),
      color: z.string(),
    })
  ),
})

const defaultValues = {
  labels: [
    {
      id: '1',
      label: 'Inbox',
      IMAPLabel: 'INBOX',
      color: '#123356',
    },
    {
      id: '2',
      label: 'Sent',
      IMAPLabel: 'Sent',
      color: '#E29EJj',
    },
    {
      id: '3',
      label: 'Drafts',
      IMAPLabel: 'Drafts',
      color: '#l9jsf8',
    },
    {
      id: '4',
      label: 'Trash',
      IMAPLabel: 'Trash',
      color: '#eeeeee',
    },
  ],
}

export { defaultValues, schema }
