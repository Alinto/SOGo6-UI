'use client'

import { useSidebar } from '@/components/ui/sidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePathname } from '@/lib/i18n/navigation'
import { useEffect, useRef } from 'react'

export function useCloseMobileSidebarOnNavigate() {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const { setOpenMobile } = useSidebar()
  const previousPathnameRef = useRef(pathname)

  useEffect(() => {
    if (previousPathnameRef.current === pathname) return

    previousPathnameRef.current = pathname

    if (isMobile) {
      setOpenMobile(false)
    }
  }, [pathname, isMobile, setOpenMobile])
}
