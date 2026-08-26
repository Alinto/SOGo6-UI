export type OfflineUnavailableTarget =
  | 'mail'
  | 'folder'
  | 'calendar'
  | 'contacts'
  | 'tasks'
  | 'settings'

export type OfflineModuleId = 'calendar' | 'contacts' | 'tasks' | 'settings'

export function moduleTargetFromHref(href: string): OfflineModuleId | null {
  if (href.startsWith('/user_settings')) return 'settings'
  if (href.startsWith('/calendars')) return 'calendar'
  if (href.startsWith('/address_books')) return 'contacts'
  if (href === '/tasks' || href.startsWith('/tasks/')) return 'tasks'
  return null
}

export function isMailFolderUnavailableTarget(
  target: OfflineUnavailableTarget
): boolean {
  return target === 'mail' || target === 'folder'
}
