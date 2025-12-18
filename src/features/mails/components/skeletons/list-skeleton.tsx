import { Skeleton } from '@/components/ui/skeleton'

const ROWS = 16

export default function MailListSkeleton() {
  return (
    <div className="flex max-h-[90vh] min-h-0 w-full flex-col rounded">
      {/* Header skeleton */}
      <div className="text-foreground flex flex-row items-center justify-between">
        {/* Left side: Checkbox, folder name, message count */}
        <div className="flex flex-row items-center gap-4">
          {/* Checkbox */}
          <Skeleton className="h-5 w-5 rounded-sm" />
          {/* Folder name */}
          <Skeleton className="h-6 w-24" />
          {/* Nb messages - hidden on small screens */}
          <Skeleton className="hidden h-4 w-20 md:inline-block" />
        </div>
        {/* Right side: Filters, Sort, Pagination */}
        <div className="flex flex-row items-center justify-between gap-2">
          {/* Filter toggle group - hidden on lg screens and below */}
          <div className="hidden lg:flex">
            <Skeleton className="h-9 w-48 rounded-md" />
          </div>
          {/* Filter dropdown - visible on lg screens and below */}
          <div className="lg:hidden">
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
          {/* Sort */}
          <Skeleton className="h-9 w-9 rounded-md" />
          {/* Pagination */}
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
      </div>
      {/* Rows skeleton */}
      <div className="scrollbar-thin-gray mt-2 overflow-y-auto rounded">
        {Array.from({ length: ROWS }).map((_, i) => (
          <div
            key={i}
            className={`flex items-center gap-4 px-6 py-3 ${
              i % 2 === 0 ? 'bg-muted/40' : ''
            }`}
          >
            {/* Checkbox */}
            <Skeleton className="h-5 w-5 rounded-sm" />
            {/* Avatar/Initial */}
            <Skeleton className="h-8 w-8 rounded-full" />
            {/* Sender */}
            <Skeleton className="h-5 w-32 rounded" />
            {/* Subject */}
            <Skeleton className="h-5 w-64 rounded" />
            {/* Attachments */}
            <Skeleton className="h-5 w-5 rounded" />
            {/* Spacer */}
            <div className="flex-1" />
            {/* Date */}
            <Skeleton className="h-5 w-16 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
