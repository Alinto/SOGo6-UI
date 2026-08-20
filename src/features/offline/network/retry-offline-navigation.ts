/** Stay in the app: never send `/~offline` “Try again” to `/` (login). */
export function retryOfflineNavigation(): void {
  if (typeof window === 'undefined') return
  window.history.back()
}
