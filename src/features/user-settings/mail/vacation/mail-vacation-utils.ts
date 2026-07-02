import type { ApiVacation } from './mail-vacation-api-types'
import {
  DEFAULT_VACATION,
  EMPTY_WEEKDAYS,
  SIEVE_WEEKDAY_BY_UI_KEY,
  UI_WEEKDAY_BY_SIEVE_DAY,
  UI_WEEKDAY_KEYS,
} from './mail-vacation-constants'
import type {
  MailVacation,
  VacationDateRange,
  VacationWeekdays,
} from './mail-vacation-types'
export function createEmptyVacation(): MailVacation {
  return {
    ...DEFAULT_VACATION,
    constraints: {
      ...DEFAULT_VACATION.constraints,
      days: { ...EMPTY_WEEKDAYS },
    },
  }
}

export function formatDateForApi(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseApiDate(value: string | null | undefined): Date | undefined {
  if (!value) return undefined
  const datePart = value.split('T')[0]
  const [year, month, day] = datePart.split('-').map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day)
}

function mapApiDaysToUi(days: number[]): VacationWeekdays {
  const result = { ...EMPTY_WEEKDAYS }
  for (const day of days) {
    const key = UI_WEEKDAY_BY_SIEVE_DAY[day]
    if (key) {
      result[key] = true
    }
  }
  return result
}

function mapUiDaysToApi(days: VacationWeekdays): number[] {
  return UI_WEEKDAY_KEYS.filter((key) => days[key])
    .map((key) => SIEVE_WEEKDAY_BY_UI_KEY[key])
    .sort((a, b) => a - b)
}

function mapApiDateRange(
  startDate: string | null,
  endDate: string | null
): VacationDateRange | null {
  const from = parseApiDate(startDate)
  const to = parseApiDate(endDate)
  if (!from && !to) return null
  return { from, to }
}

export function mapApiVacationToUi(api: ApiVacation | null): MailVacation {
  if (!api) {
    return createEmptyVacation()
  }

  const hasDates = Boolean(api.startDate || api.endDate)
  const hasHours = Boolean(api.startTime || api.endTime)
  const hasWeekdays = api.weekdaysEnabled || api.days.length > 0

  return {
    enabled: Boolean(api.enabled),
    customSubject: api.customSubject ?? '',
    autoReplyText: api.autoReplyText ?? '',
    constraints: {
      enableDates: hasDates,
      dateRange: mapApiDateRange(api.startDate, api.endDate),
      enableHours: hasHours,
      startTime: api.startTime ?? DEFAULT_VACATION.constraints.startTime,
      endTime: api.endTime ?? DEFAULT_VACATION.constraints.endTime,
      weekdaysEnabled: hasWeekdays,
      days: mapApiDaysToUi(api.days ?? []),
    },
    alwaysSend: Boolean(api.alwaysSend),
    ignoreLists: api.ignoreLists ?? false,
  }
}

export function mapUiVacationToApi(
  ui: MailVacation,
  timezone?: string
): ApiVacation {
  const trimmedSubject = ui.customSubject.trim()

  return {
    enabled: ui.enabled ? 1 : 0,
    customSubjectEnabled: trimmedSubject.length > 0,
    customSubject: ui.customSubject,
    autoReplyText: ui.autoReplyText,
    startDate:
      ui.constraints.enableDates && ui.constraints.dateRange?.from
        ? formatDateForApi(ui.constraints.dateRange.from)
        : null,
    endDate:
      ui.constraints.enableDates && ui.constraints.dateRange?.to
        ? formatDateForApi(ui.constraints.dateRange.to)
        : null,
    timezone: timezone ?? null,
    alwaysSend: ui.alwaysSend ? 1 : 0,
    ignoreLists: ui.ignoreLists,
    startTime: ui.constraints.enableHours ? ui.constraints.startTime : null,
    endTime: ui.constraints.enableHours ? ui.constraints.endTime : null,
    weekdaysEnabled: ui.constraints.weekdaysEnabled,
    days: ui.constraints.weekdaysEnabled
      ? mapUiDaysToApi(ui.constraints.days)
      : [],
  }
}
