export type OfflineUnavailableTarget =
  | 'mail'
  | 'folder'
  | 'calendar'
  | 'contacts'
  | 'tasks'
  | 'settings'
  | 'notes'
  | 'admin'

export type OfflineModuleId =
  | 'calendar'
  | 'contacts'
  | 'tasks'
  | 'settings'
  | 'notes'
  | 'admin'

export function moduleTargetFromHref(href: string): OfflineModuleId | null {
  if (href.startsWith('/user_settings')) return 'settings'
  if (href.startsWith('/calendars')) return 'calendar'
  if (href.startsWith('/address_books')) return 'contacts'
  if (href === '/tasks' || href.startsWith('/tasks/')) return 'tasks'
  if (href === '/notes' || href.startsWith('/notes/')) return 'notes'
  if (href.startsWith('/admin_panel')) return 'admin'
  return null
}

export function isMailFolderUnavailableTarget(
  target: OfflineUnavailableTarget
): boolean {
  return target === 'mail' || target === 'folder'
}

export function isNonMailModuleOverlay(
  kind: string,
  target?: OfflineUnavailableTarget
): boolean {
  return (
    kind === 'unavailable' && !!target && !isMailFolderUnavailableTarget(target)
  )
}
