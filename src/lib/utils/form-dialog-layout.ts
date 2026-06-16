import { cn } from '@/lib/utils'

export function formDialogContentClassName(width: 'lg' | '2xl' = '2xl') {
  return cn(
    'flex min-h-0 flex-col gap-0 overflow-hidden p-0',
    'max-h-[90vh] max-sm:top-0 max-sm:left-0 max-sm:h-[100dvh] max-sm:max-h-[100dvh] max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none max-sm:border-0',
    width === 'lg' ? 'sm:max-w-lg' : 'sm:max-w-2xl'
  )
}

export const formDialogHeaderClassName =
  'shrink-0 border-b px-6 pt-6 pb-4 text-left'

export const formDialogTitleClassName =
  'text-xl font-semibold tracking-tight'

export const formDialogBodyClassName =
  'scrollbar-thin-gray flex min-h-0 flex-1 flex-col space-y-4 overflow-y-auto px-6 py-4'

export const formDialogFooterClassName =
  'bg-background flex shrink-0 justify-end gap-2 border-t px-6 py-4'
