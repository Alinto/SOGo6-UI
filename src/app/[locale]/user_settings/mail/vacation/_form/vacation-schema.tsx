'use client'
import { z } from 'zod'

const schema = z.object({
  enabled: z.boolean(),
  subject: z.string(),
  message: z.string(),
  constraints: z.object({
    startDate: z.string(),
    endDate: z.string(),
    startHour: z.string(),
    endHour: z.string(),
    days: z.object({
      monday: z.boolean(),
      tuesday: z.boolean(),
      wednesday: z.boolean(),
      thursday: z.boolean(),
      friday: z.boolean(),
      saturday: z.boolean(),
      sunday: z.boolean(),
    }),
  }),
  emails: z.array(z.string()),
  response: z.object({
    interval: z.string(),
    toMaillingList: z.boolean(),
    alwaysSend: z.boolean(),
  }),
  discardMails: z.boolean(),
})

const defaultValues = {
  enabled: true,
  autoReply: {
    subject: '',
    message: '',
    constraints: {
      enableDates: false,
      enableHours: false,
      enableDays: false,
      startDate: '',
      endDate: '',
      startHour: '18:00',
      endHour: '',
      days: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      },
    },
    emails: [],
    response: {
      interval: '0',
      toMaillingList: false,
      alwaysSend: false,
    },
    discardMails: false,
  },
}

export { defaultValues, schema }
