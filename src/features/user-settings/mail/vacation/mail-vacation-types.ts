export interface VacationDateRange {
  from?: Date
  to?: Date
}

export interface VacationWeekdays {
  monday: boolean
  tuesday: boolean
  wednesday: boolean
  thursday: boolean
  friday: boolean
  saturday: boolean
  sunday: boolean
}

export interface MailVacation {
  enabled: boolean
  customSubject: string
  autoReplyText: string
  constraints: {
    enableDates: boolean
    dateRange: VacationDateRange | null
    enableHours: boolean
    startTime: string
    endTime: string
    weekdaysEnabled: boolean
    weekdays: VacationWeekdays
    responseIntervalDays: number | null
  }
  alwaysSend: boolean
}
