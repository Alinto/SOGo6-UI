/**
 * @jest-environment jsdom
 */
import {
  isNonMailModuleOverlay,
  moduleTargetFromHref,
} from '../offline-modules'

describe('moduleTargetFromHref', () => {
  it('maps app paths to overlay targets', () => {
    expect(moduleTargetFromHref('/calendars')).toBe('calendar')
    expect(moduleTargetFromHref('/address_books/abc')).toBe('contacts')
    expect(moduleTargetFromHref('/tasks')).toBe('tasks')
    expect(moduleTargetFromHref('/user_settings/profile')).toBe('settings')
    expect(moduleTargetFromHref('/notes')).toBe('notes')
    expect(moduleTargetFromHref('/notes/foo')).toBe('notes')
  })

  it('ignores mail routes', () => {
    expect(moduleTargetFromHref('/u/0/INBOX')).toBeNull()
  })
})

describe('isNonMailModuleOverlay', () => {
  it('detects calendar overlays and ignores mail folders', () => {
    expect(isNonMailModuleOverlay('unavailable', 'calendar')).toBe(true)
    expect(isNonMailModuleOverlay('unavailable', 'folder')).toBe(false)
    expect(isNonMailModuleOverlay('route')).toBe(false)
  })
})
