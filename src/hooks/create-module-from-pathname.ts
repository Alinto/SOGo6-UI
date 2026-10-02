export type CreateModuleId = 'mail' | 'calendar' | 'contact' | 'task'

export function hasModuleAccess(
  moduleAccess: string[],
  module: string,
  isLoading: boolean
): boolean {
  if (isLoading || moduleAccess.length === 0) return true
  return moduleAccess.includes(module)
}

export function createModuleFromPathname(
  pathname: string,
  moduleAccess: string[],
  isLoading: boolean
): CreateModuleId | null {
  const firstSection = pathname.split('/')[1]

  if (
    firstSection === 'u' &&
    hasModuleAccess(moduleAccess, 'mail', isLoading)
  ) {
    return 'mail'
  }
  if (
    firstSection === 'calendars' &&
    hasModuleAccess(moduleAccess, 'calendar', isLoading)
  ) {
    return 'calendar'
  }
  if (firstSection === 'tasks') return 'task'
  if (
    firstSection === 'address_books' &&
    hasModuleAccess(moduleAccess, 'contact', isLoading)
  ) {
    return 'contact'
  }
  return null
}
