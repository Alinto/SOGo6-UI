import type { MailVacation, VacationWeekdays } from './mail-vacation-types'

export const TIME_FORMAT_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/

export const SIEVE_WEEKDAY_BY_UI_KEY: Record<keyof VacationWeekdays, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
}

export const UI_WEEKDAY_BY_SIEVE_DAY: Record<number, keyof VacationWeekdays> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
}

export const UI_WEEKDAY_KEYS: (keyof VacationWeekdays)[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

export const EMPTY_WEEKDAYS: VacationWeekdays = {
  monday: false,
  tuesday: false,
  wednesday: false,
  thursday: false,
  friday: false,
  saturday: false,
  sunday: false,
}

export const DEFAULT_VACATION: MailVacation = {
  enabled: false,
  customSubject: '',
  autoReplyText: '',
  constraints: {
    enableDates: false,
    dateRange: null,
    enableHours: false,
    startTime: '18:00',
    endTime: '08:00',
    weekdaysEnabled: false,
    days: { ...EMPTY_WEEKDAYS },
  },
  alwaysSend: false,
  ignoreLists: false,
}
