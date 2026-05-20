'use client'

import { useAppSelector } from '@/lib/redux/hooks'
import { selectOpenDraftIds } from '../../store'
import FloatingCompose from './floating-compose'

const FloatingComposeContainer = () => {
  const openDraftIds = useAppSelector(selectOpenDraftIds)
  console.log('Open draft IDs:', openDraftIds) // Debug log to check the value of openDraftIds

  if (openDraftIds.length === 0) {
    return null
  }

  return (
    <div className="pointer-events-none fixed right-14 bottom-0 z-100 flex flex-row-reverse items-end -space-x-32 space-x-reverse px-4">
      {openDraftIds.map((draftId) => (
        <FloatingCompose key={draftId} draftId={draftId} />
      ))}
    </div>
  )
}

export default FloatingComposeContainer
