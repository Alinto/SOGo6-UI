'use client'

import { useSidebar } from '@/components/ui/sidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePathname } from '@/lib/i18n/navigation'
import { useEffect, useRef } from 'react'

/** After a navigation, closes the menu drawer (mobile) and collapses a menu
 *  temporarily expanded over its icon rail (compact mode, tablet). */
export function useCloseMobileSidebarOnNavigate() {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const { setOpenMobile, isCompact, setOpen } = useSidebar()
  const previousPathnameRef = useRef(pathname)

  useEffect(() => {
    if (previousPathnameRef.current === pathname) return

    previousPathnameRef.current = pathname

    if (isMobile) {
      setOpenMobile(false)
    }
    if (isCompact) {
      setOpen(false)
    }
  }, [pathname, isMobile, isCompact, setOpen, setOpenMobile])
}
