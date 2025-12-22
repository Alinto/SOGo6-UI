'use client'

import { Skeleton } from '@/components/ui/skeleton'

export default function MailDetailSkeleton() {
  return (
    <div className="w-full overflow-hidden">
      {/* Top action bar */}
      <div className="mb-6 flex flex-wrap items-center gap-2 px-2 pt-4 sm:px-6">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="ml-auto flex items-center gap-2">
          <Skeleton className="h-8 w-10 rounded" />
          <Skeleton className="h-8 w-10 rounded" />
        </div>
      </div>

      {/* Sujet du mail */}
      <Skeleton className="mb-5 ml-2 h-7 w-1/4 sm:ml-6" />

      {/* Bloc header mail */}
      <div className="bg-muted/50 mb-6 flex w-full flex-col rounded-lg px-2 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        {/* Avatar + infos expéditeur/destinataire */}
        <div className="flex flex-row items-start gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex flex-col justify-center gap-2">
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-12 rounded" /> {/* From */}
              <Skeleton className="h-5 w-48" /> {/* Expéditeur */}
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-12 rounded" /> {/* To */}
              <Skeleton className="h-5 w-48" /> {/* Destinataire */}
            </div>
          </div>
        </div>
        {/* Date + actions mail à droite */}
        <div className="mt-3 flex flex-row items-center gap-4 sm:mt-0">
          <Skeleton className="h-4 w-24 rounded" /> {/* Date */}
          <Skeleton className="h-9 w-10 rounded" />
          <Skeleton className="h-9 w-10 rounded" />
          <Skeleton className="h-9 w-10 rounded" />
        </div>
      </div>

      {/* Contenu du mail */}
      <div className="mt-4 w-full rounded-lg px-2 sm:px-8">
        <Skeleton className="mb-2 h-5 w-1/2" /> {/* Petit snippet */}
        <Skeleton className="h-[320px] w-full rounded-lg" />
      </div>
    </div>
  )
}
