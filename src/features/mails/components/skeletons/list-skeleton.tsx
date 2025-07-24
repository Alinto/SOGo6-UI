import { Skeleton } from '@/components/ui/skeleton'

const ROWS = 16

export default function MailListSkeleton() {
  return (
    <div className="flex h-full w-full flex-col">
      {/* Header skeleton */}
      <div className="bg-background flex items-center gap-2 border-b px-6 py-3">
        {/* Checkbox */}
        <Skeleton className="h-5 w-5 rounded-sm" />
        {/* Folder name */}
        <Skeleton className="h-5 w-32" />
        {/* Nb messages */}
        <Skeleton className="h-5 w-16" />
        {/* Spacer */}
        <div className="flex-1" />
        {/* Filters & actions */}
        <Skeleton className="h-8 w-32 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-16 rounded-md" />
      </div>
      {/* Rows skeleton */}
      <div className="flex flex-col">
        {Array.from({ length: ROWS }).map((_, i) => (
          <div
            key={i}
            className={`flex items-center px-6 py-3 ${
              i % 2 === 0 ? 'bg-muted/40' : ''
            }`}
          >
            {/* Avatar/Initial */}
            <Skeleton className="mr-4 h-8 w-8 rounded-full" />
            {/* Expéditeur */}
            <Skeleton className="h-5 w-32 rounded" />
            {/* Sujet */}
            <Skeleton className="ml-4 h-5 w-64 rounded" />
            {/* Attachments */}
            <Skeleton className="ml-4 h-5 w-5 rounded" />
            {/* Spacer */}
            <div className="flex-1" />
            {/* Date */}
            <Skeleton className="ml-4 h-5 w-16 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
