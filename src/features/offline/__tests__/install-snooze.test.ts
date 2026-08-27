import {
  INSTALL_SNOOZE_MS,
  installSnoozeUntil,
  isInstallSnoozed,
} from '../install-snooze'

describe('isInstallSnoozed', () => {
  const now = 1_700_000_000_000

  it('is hidden while the snooze timestamp is in the future', () => {
    expect(isInstallSnoozed(now, String(now + INSTALL_SNOOZE_MS))).toBe(true)
  })

  it('is shown after the snooze expires', () => {
    expect(isInstallSnoozed(now + INSTALL_SNOOZE_MS + 1, String(now))).toBe(
      false
    )
  })

  it('is shown when no timestamp is stored', () => {
    expect(isInstallSnoozed(now, null)).toBe(false)
  })

  it('writes a timestamp 14 days ahead', () => {
    expect(installSnoozeUntil(now)).toBe(String(now + INSTALL_SNOOZE_MS))
  })
})
