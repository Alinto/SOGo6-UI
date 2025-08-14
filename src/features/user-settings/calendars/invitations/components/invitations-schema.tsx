'use client'
import { z, ZodObject, ZodType } from 'zod'
import { CalendarInvitations } from '../calendars-invitations-types'

type InvitationsSettingsSchema = ZodObject<{
  [K in keyof Partial<CalendarInvitations>]: K extends keyof CalendarInvitations
    ? ZodType<CalendarInvitations[K]>
    : never
}>

const schema = z.object({
  disable_notifications: z.boolean(),
  prevent_invitations: z.boolean(),
  invitations_wlist: z.array(z.string()),
}) satisfies InvitationsSettingsSchema

const defaultValues = {
  disable_notifications: false,
  prevent_invitations: false,
  invitations_wlist: [],
}

export { defaultValues, schema }
