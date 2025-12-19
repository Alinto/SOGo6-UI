import { useLatest } from '@/hooks/use-latest'
import { useEffect } from 'react'

export function useUnmount(fn: () => void) {
  const fnRef = useLatest(fn)

  useEffect(
    () => () => {
      fnRef.current()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
}
