'use client'

import { Button } from '@/components/ui/button'
import { TooltipWrapper } from '@/components/ui/tooltip'
import {
  useGetPreferencesQuery,
  useUpdatePreferencesMutation,
} from '@/features/app-data/store/user-preferences-api'
import {
  usePathname,
  useRouter,
  useSearchParams,
  useParams,
} from 'next/navigation'
import { Columns2, LayoutList } from 'lucide-react'
import React from 'react'

const MailViewToggle: React.FC = () => {
  const { data } = useGetPreferencesQuery()
  const [updatePreferences, { isLoading }] = useUpdatePreferencesMutation()
  const mailDisplayMode = data?.mailDisplayMode ?? 'modern'
  const isModern = mailDisplayMode === 'classic'
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams() as {
    account?: string
    folder?: string | string[]
  }
  const searchParams = useSearchParams()

  const folderSegments = Array.isArray(params.folder)
    ? params.folder
    : params.folder
      ? [params.folder]
      : []
  const encodedFolder = folderSegments.map((seg) => encodeURIComponent(seg)).join('/')
  const encodedAccount = params.account ? encodeURIComponent(params.account) : ''
  const folderPath = encodedFolder ? `/${encodedFolder}` : ''
  const baseRoute = `/u/${encodedAccount}${folderPath}`

  const segments = pathname.split('?')[0].split('/').filter(Boolean)
  const baseSegmentCount = 2 + folderSegments.length
  const remainingSegments = segments.slice(baseSegmentCount)
  const normalizedSegments = remainingSegments.filter(
    (segment) => segment !== '@classic' && segment !== '@visualization'
  )
  const currentMailId = normalizedSegments[0]

  const queryString = searchParams.toString()
  const searchSuffix = queryString ? `?${queryString}` : ''
  const classicPath = `${baseRoute}/@classic${
    currentMailId ? `/@visualization/${encodeURIComponent(currentMailId)}` : ''
  }${searchSuffix}`
  const modernPath = `${baseRoute}${
    currentMailId ? `/${encodeURIComponent(currentMailId)}` : ''
  }${searchSuffix}`

  const handleToggle = () => {
    updatePreferences({
      mailDisplayMode: isModern ? 'modern' : 'classic',
    })
    router.push(isModern ? classicPath : modernPath)
  }

  return (
    <TooltipWrapper content={isModern ? 'Split view' : 'Full view'}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        disabled={isLoading}
        aria-label="Mail view toggle"
      >
        {isModern ? (
          <Columns2 size={16} data-testid="mail-view-toggle-columns" />
        ) : (
          <LayoutList size={16} data-testid="mail-view-toggle-layout-list" />
        )}
      </Button>
    </TooltipWrapper>
  )
}

export default MailViewToggle
