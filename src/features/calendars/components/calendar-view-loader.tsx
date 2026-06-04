/** Lightweight placeholder while react-big-calendar chunk loads */
export function CalendarViewLoader() {
  return (
    <div
      data-testid="calendar-view-loader"
      className="flex h-full min-h-[200px] flex-1 items-center justify-center"
      aria-busy="true"
    >
      <div className="border-primary h-10 w-10 animate-spin rounded-full border-b-2" />
    </div>
  )
}
