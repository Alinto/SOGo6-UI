// Types
export type {
  ApiCalendarEventResponse,
  ApiCalendarResponse,
  ApiCalendarsResponse,
  ApiCalendarEventsResponse,
  Calendar,
  CalendarCreateBody,
  CalendarEvent,
  CalendarEventCreateBody,
  CalendarEventQueryArgs,
  CalendarEventUpdateBody,
  CalendarEventsResponse,
  CalendarType,
  CalendarUpdateBody,
  CalendarsResponse,
  EventAttendee,
  EventRecurrence,
  EventReminder,
} from './calendars-types'

// API & Hooks from RTK Query
export {
  useCreateCalendarMutation,
  useCreateCalendarEventMutation,
  useDeleteCalendarMutation,
  useDeleteCalendarEventMutation,
  useGetAllEventsQuery,
  useGetCalendarByIdQuery,
  useGetCalendarEventByIdQuery,
  useGetCalendarEventsQuery,
  useGetCalendarsByTypeQuery,
  useGetCalendarsQuery,
  useGetEventsInTimeRangeQuery,
  useUpdateCalendarMutation,
  useUpdateCalendarEventMutation,
} from './store/calendars-api'
