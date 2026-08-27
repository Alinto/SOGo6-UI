export const INSTALL_SNOOZE_MS = 14 * 24 * 60 * 60 * 1000
export const INSTALL_SNOOZE_KEY = 'sogo_pwa_install_snoozed_until'

export function isInstallSnoozed(
  now: number,
  untilRaw: string | null
): boolean {
  if (!untilRaw) return false
  const until = Number(untilRaw)
  if (!Number.isFinite(until)) return false
  return now < until
}

export function installSnoozeUntil(now: number): string {
  return String(now + INSTALL_SNOOZE_MS)
}

export function readInstallSnoozeUntil(): string | null {
  try {
    return localStorage.getItem(INSTALL_SNOOZE_KEY)
  } catch {
    return null
  }
}

export function writeInstallSnoozeUntil(until: string): void {
  try {
    localStorage.setItem(INSTALL_SNOOZE_KEY, until)
  } catch {
    // storage unavailable — session-only dismissal
  }
}
