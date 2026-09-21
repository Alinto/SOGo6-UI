import { useAppSelector } from '@/lib/redux/hooks'
import { isOtherOwner } from '@/lib/utils/owner'
import { useCallback } from 'react'

/** Returns a predicate telling whether an `owner` differs from the connected account. */
export function useIsOtherOwner() {
  const user = useAppSelector((state) => state.auth.user)

  return useCallback(
    (owner?: string | null) => isOtherOwner(owner, user),
    [user]
  )
}
