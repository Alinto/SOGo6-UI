import ListLoadingOverlay from '@/features/mails/components/list-loading-overlay'
import MailListSkeleton from '@/features/mails/components/skeletons/list-skeleton'
import React, { memo } from 'react'

/** Mail list skeleton with the loading spinner on top (first fetch of a folder). */
const MailListLoadingSkeleton: React.FC = () => (
  <div className="relative flex min-h-0 w-full flex-1 flex-col">
    {/* The status stays outside the busy region so it is announced. */}
    <div aria-busy="true" className="flex min-h-0 flex-1 flex-col">
      <MailListSkeleton />
    </div>
    <ListLoadingOverlay />
  </div>
)

export default memo(MailListLoadingSkeleton)
