import type {
  ApiVacation,
  ApiVacationLegacy,
} from './mail-vacation-api-types'
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

type ApiVacationInput = ApiVacation | ApiVacationLegacy | null

function toBoolean(value: boolean | 0 | 1 | undefined): boolean {
  return Boolean(value)
}

function normalizeApiVacation(
  api: ApiVacationInput
): ApiVacation | null {
  if (!api) return null

  const legacy = api as ApiVacationLegacy
  const snake = api as ApiVacation

  const weekdayRaw = snake.weekday ?? legacy.days
  const weekday = Array.isArray(weekdayRaw) ? weekdayRaw : []

  const responseDaysRaw = snake.days ?? legacy.days
  const responseIntervalDays =
    typeof responseDaysRaw === 'number' ? responseDaysRaw : null

  return {
    enabled: toBoolean(snake.enabled ?? legacy.enabled),
    custom_subject_enabled: Boolean(
      snake.custom_subject_enabled ?? legacy.customSubjectEnabled
    ),
    custom_subject: snake.custom_subject ?? legacy.customSubject ?? '',
    auto_reply_text: snake.auto_reply_text ?? legacy.autoReplyText ?? '',
    start_date: snake.start_date ?? legacy.startDate ?? null,
    end_date: snake.end_date ?? legacy.endDate ?? null,
    timezone: snake.timezone ?? legacy.timezone ?? null,
    always_send: toBoolean(snake.always_send ?? legacy.alwaysSend),
    start_time: snake.start_time ?? legacy.startTime ?? null,
    end_time: snake.end_time ?? legacy.endTime ?? null,
    weekdays_enabled: Boolean(
      snake.weekdays_enabled ?? legacy.weekdaysEnabled ?? weekday.length > 0
    ),
    weekday,
    days: responseIntervalDays,
  }
}

export function createEmptyVacation(): MailVacation {
  return {
    ...DEFAULT_VACATION,
    constraints: {
      ...DEFAULT_VACATION.constraints,
      weekdays: { ...EMPTY_WEEKDAYS },
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

function mapApiWeekdayToUi(weekday: number[]): VacationWeekdays {
  const result = { ...EMPTY_WEEKDAYS }
  for (const day of weekday) {
    const key = UI_WEEKDAY_BY_SIEVE_DAY[day]
    if (key) {
      result[key] = true
    }
  }
  return result
}

function mapUiWeekdaysToApi(weekdays: VacationWeekdays): number[] {
  return UI_WEEKDAY_KEYS.filter((key) => weekdays[key])
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

export function mapApiVacationToUi(api: ApiVacationInput): MailVacation {
  const normalized = normalizeApiVacation(api)
  if (!normalized) {
    return createEmptyVacation()
  }

  const hasDates = Boolean(normalized.start_date || normalized.end_date)
  const hasHours = Boolean(normalized.start_time || normalized.end_time)
  const hasWeekdays =
    normalized.weekdays_enabled || normalized.weekday.length > 0

  const customSubject =
    normalized.custom_subject_enabled || normalized.custom_subject.trim().length > 0
      ? normalized.custom_subject
      : ''

  return {
    enabled: normalized.enabled,
    customSubject,
    autoReplyText: normalized.auto_reply_text ?? '',
    constraints: {
      enableDates: hasDates,
      dateRange: mapApiDateRange(normalized.start_date, normalized.end_date),
      enableHours: hasHours,
      startTime:
        normalized.start_time ?? DEFAULT_VACATION.constraints.startTime,
      endTime: normalized.end_time ?? DEFAULT_VACATION.constraints.endTime,
      weekdaysEnabled: hasWeekdays,
      weekdays: mapApiWeekdayToUi(normalized.weekday ?? []),
      responseIntervalDays: normalized.days,
    },
    alwaysSend: normalized.always_send,
  }
}

export function mapUiVacationToApi(
  ui: MailVacation,
  timezone?: string
): ApiVacation {
  const trimmedSubject = ui.customSubject.trim()

  return {
    enabled: ui.enabled,
    custom_subject_enabled: trimmedSubject.length > 0,
    custom_subject: ui.customSubject,
    auto_reply_text: ui.autoReplyText,
    start_date:
      ui.constraints.enableDates && ui.constraints.dateRange?.from
        ? formatDateForApi(ui.constraints.dateRange.from)
        : null,
    end_date:
      ui.constraints.enableDates && ui.constraints.dateRange?.to
        ? formatDateForApi(ui.constraints.dateRange.to)
        : null,
    timezone: timezone ?? null,
    always_send: ui.alwaysSend,
    start_time: ui.constraints.enableHours ? ui.constraints.startTime : null,
    end_time: ui.constraints.enableHours ? ui.constraints.endTime : null,
    weekdays_enabled: ui.constraints.weekdaysEnabled,
    weekday: ui.constraints.weekdaysEnabled
      ? mapUiWeekdaysToApi(ui.constraints.weekdays)
      : [],
    days: ui.constraints.responseIntervalDays,
  }
}
