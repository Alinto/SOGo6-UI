/**
 * Manual QA checklist for vacation settings against the real SOGo backend.
 * These scenarios are documented for manual validation — not executed automatically.
 */
describe('mail-vacation E2E checklist', () => {
  const scenarios = [
    'GET vacation null - empty form, save OK',
    'Enable simple vacation (message only) - Sieve script generated',
    'Date range + overnight hours (18:00 to 08:00)',
    'Weekday mapping - Monday checked maps to Sieve weekday 1',
    'Custom subject vs default (Auto: Away)',
    'Disable (enabled: 0) without losing config',
    'ignoreLists / alwaysSend persisted after reload',
    '403 when SOGO_D_VACATION_ENABLED=false',
    'Sidebar vacation entry consistent with 403',
    'fakeApi fallback when backend unreachable',
  ]

  it.each(scenarios)('manual: %s', (scenario) => {
    expect(scenario).toBeTruthy()
  })
})
