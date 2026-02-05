import { useGetUserPreferencesQuery } from '@/features/user-settings/store/user-preferences-api'
import { useAppSelector } from '@/lib/redux/hooks'

export function usePermission(permissionKey: string) {
  const { data: settings } = useGetUserPreferencesQuery()

  if (!settings?.permissions) return false

  return Boolean(settings.permissions[permissionKey])
}

export function usePermissions(required = [], mode = 'AND') {
  const permissions = useAppSelector((state) => state.permissions.list)

  if (mode === 'AND') {
    return required.every((p) => permissions.includes(p))
  }

  if (mode === 'OR') {
    return required.some((p) => permissions.includes(p))
  }

  return false
}

// Component that conditionally renders children based on permission
// e.g. <PermissionWrapper permission="USER_EDIT"><EditButton /></PermissionWrapper>
export function PermissionWrapper({ permission, children }) {
  const allowed = usePermission(permission)
  return allowed ? children : null
}
