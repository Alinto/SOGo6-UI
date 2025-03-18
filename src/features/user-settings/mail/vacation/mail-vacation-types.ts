export interface MailVacation {
  enabled: boolean
  autoReply: {
    subject: string
    message: string
    constraints: {
      enableDates: boolean
      enableHours: boolean
      enableDays: boolean
      startDate: string
      endDate: string
      startHour: string
      endHour: string
      days: {
        monday: boolean
        tuesday: boolean
        wednesday: boolean
        thursday: boolean
        friday: boolean
        saturday: boolean
        sunday: boolean
      }
    }
    emails: string[]
    response: {
      interval: string
      toMaillingList: boolean
      alwaysSend: boolean
    }
    discardMails: boolean
  }
}
