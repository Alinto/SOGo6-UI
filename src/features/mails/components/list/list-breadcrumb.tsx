'use client'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  MEASURE_ATTRIBUTE,
  useBreadcrumbFit,
} from '@/features/mails/hooks/use-breadcrumb-fit'
import type { ImapFolder } from '@/features/mails/mails-types'
import { useGetFoldersQuery } from '@/features/mails/store/mails-api'
import { canOpenFolder } from '@/features/mails/utils/folder-permissions'
import { getFolderTranslationKey } from '@/features/mails/utils/folder-type-helpers'
import {
  collapseBreadcrumb,
  getFolderBreadcrumb,
} from '@/features/mails/utils/get-folder-breadcrumb'
import { useOfflineNav } from '@/features/offline/offline-nav-context'
import { useLongPress } from '@/hooks/use-long-press'
import { getPathname } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'
import { MoreHorizontal } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import React, { memo, useCallback, useMemo, useRef, useState } from 'react'

interface ListBreadcrumbProps {
  accountId: string
  folderPath: string
  /** Shown when the folder is not in the tree (loading, advanced search…). */
  fallbackTitle: string
  /** Shown right after the breadcrumb (e.g. the message count). */
  suffix?: React.ReactNode
}

const HIDDEN_FOLDERS_SEPARATOR = ' / '

const ITEM_BASE =
  // Same height as the filter buttons on the right of the toolbar (h-9).
  'flex h-9 min-w-0 items-center pr-5 pl-3 text-sm leading-none font-semibold'
// Rectangle with an arrow tip on the right; next items also get a notch on
// the left so the chevrons fit into each other.
const FIRST_SHAPE =
  'rounded-l-md [clip-path:polygon(0_0,calc(100%-10px)_0,100%_50%,calc(100%-10px)_100%,0_100%)]'
const NEXT_SHAPE =
  '-ml-1 pl-5 [clip-path:polygon(0_0,calc(100%-10px)_0,100%_50%,calc(100%-10px)_100%,0_100%,10px_50%)]'
const CURRENT_COLORS = 'bg-primary text-primary-foreground'

const LINK_FOCUS =
  'focus-visible:ring-ring outline-none focus-visible:ring-2 focus-visible:ring-inset'
// A long press shows the tooltip on touch screens: keep the native link
// callout (iOS) and text selection out of the way.
const TOUCH_SAFE = 'select-none [-webkit-touch-callout:none]'

type OpenFolder = (folder: ImapFolder, label: string) => void

/** Click handler opening `folder` in the app (SPA navigation). */
function folderClickHandler(
  folder: ImapFolder,
  label: string,
  onOpen: OpenFolder,
  consumeLongPress: () => boolean
): React.MouseEventHandler<HTMLAnchorElement> {
  return (e) => {
    // The press only showed the tooltip: do not navigate.
    if (consumeLongPress()) {
      e.preventDefault()
      return
    }
    // Keep native behaviour for new tab / new window clicks.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    onOpen(folder, label)
  }
}

interface BreadcrumbItemProps {
  folder: ImapFolder
  href: string
  label: string
  isFirst: boolean
  isCurrent: boolean
  onOpen: OpenFolder
}

/**
 * One chevron of the breadcrumb. Long names are cut with an ellipsis and the
 * full name is shown in a tooltip (hover, focus or long press), only when it
 * is actually cut.
 */
const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({
  folder,
  href,
  label,
  isFirst,
  isCurrent,
  onOpen,
}) => {
  const textRef = useRef<HTMLSpanElement>(null)
  const [tooltipOpen, setTooltipOpen] = useState(false)

  const isTruncated = useCallback(() => {
    const el = textRef.current
    return !!el && el.scrollWidth > el.clientWidth
  }, [])
  const handleTooltipOpenChange = useCallback(
    (open: boolean) => setTooltipOpen(open && isTruncated()),
    [isTruncated]
  )
  const { handlers, consumeLongPress } = useLongPress(() => {
    if (isTruncated()) setTooltipOpen(true)
  })

  const className = cn(
    ITEM_BASE,
    'max-w-[10rem]',
    isFirst ? FIRST_SHAPE : NEXT_SHAPE,
    isCurrent ? CURRENT_COLORS : 'bg-muted text-foreground',
    TOUCH_SAFE
  )
  const text = (
    <span ref={textRef} className="truncate">
      {label}
    </span>
  )

  return (
    // The current folder shrinks last, and never below 4rem.
    <li className={cn('flex min-w-0', isCurrent && 'min-w-16 shrink-[0.25]')}>
      <Tooltip open={tooltipOpen} onOpenChange={handleTooltipOpenChange}>
        <TooltipTrigger asChild>
          {canOpenFolder(folder) ? (
            <a
              {...handlers}
              href={href}
              aria-current={isCurrent ? 'page' : undefined}
              className={cn(
                className,
                !isCurrent && 'hover:bg-accent',
                LINK_FOCUS
              )}
              onClick={folderClickHandler(
                folder,
                label,
                onOpen,
                consumeLongPress
              )}
            >
              {text}
            </a>
          ) : (
            <span
              {...handlers}
              aria-current={isCurrent ? 'page' : undefined}
              className={cn(className, !isCurrent && 'text-muted-foreground')}
            >
              {text}
            </span>
          )}
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </li>
  )
}

interface BreadcrumbEllipsisProps {
  /** Folder opened on click: the first hidden one. */
  target: ImapFolder
  targetHref: string
  targetLabel: string
  /** Names of the hidden folders, shown in the tooltip. */
  hiddenPath: string
  onOpen: OpenFolder
}

/** "…" chevron replacing the middle folders of a long breadcrumb. */
const BreadcrumbEllipsis: React.FC<BreadcrumbEllipsisProps> = ({
  target,
  targetHref,
  targetLabel,
  hiddenPath,
  onOpen,
}) => {
  const t = useTranslations('MAILS_LIST')
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const { handlers, consumeLongPress } = useLongPress(() =>
    setTooltipOpen(true)
  )

  const isLink = canOpenFolder(target)
  const className = cn(
    ITEM_BASE,
    NEXT_SHAPE,
    'bg-muted text-muted-foreground',
    TOUCH_SAFE
  )
  const content = (
    <>
      <MoreHorizontal aria-hidden="true" className="size-4" />
      <span className="sr-only">
        {isLink
          ? t('breadcrumb_open_hidden_folder.string', {
              folder: targetLabel,
              path: hiddenPath,
            })
          : t('breadcrumb_hidden_folders.string', { path: hiddenPath })}
      </span>
    </>
  )

  return (
    <li className="flex shrink-0">
      <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
        <TooltipTrigger asChild>
          {isLink ? (
            <a
              {...handlers}
              href={targetHref}
              className={cn(
                className,
                'hover:bg-accent hover:text-foreground',
                LINK_FOCUS
              )}
              onClick={folderClickHandler(
                target,
                targetLabel,
                onOpen,
                consumeLongPress
              )}
            >
              {content}
            </a>
          ) : (
            <span {...handlers} className={className}>
              {content}
            </span>
          )}
        </TooltipTrigger>
        <TooltipContent>{hiddenPath}</TooltipContent>
      </Tooltip>
    </li>
  )
}

interface BreadcrumbMeasureProps {
  labels: string[]
  rowRef: React.Ref<HTMLOListElement>
}

/**
 * Hidden copy of the breadcrumb at its natural width (every folder + "…"),
 * measured by `useBreadcrumbFit` to pick how many folders fit.
 */
const BreadcrumbMeasure: React.FC<BreadcrumbMeasureProps> = ({
  labels,
  rowRef,
}) => (
  <ol
    ref={rowRef}
    aria-hidden="true"
    inert
    className="pointer-events-none invisible absolute top-0 left-0 flex w-max"
  >
    {labels.map((label, index) => (
      <li
        // Labels may repeat, the position is the identity here.
        key={index}
        {...{ [MEASURE_ATTRIBUTE]: 'folder' }}
        className="flex shrink-0"
      >
        <span
          className={cn(
            ITEM_BASE,
            'max-w-[10rem]',
            index === 0 ? FIRST_SHAPE : NEXT_SHAPE
          )}
        >
          <span className="truncate">{label}</span>
        </span>
      </li>
    ))}
    <li {...{ [MEASURE_ATTRIBUTE]: 'ellipsis' }} className="flex shrink-0">
      <span className={cn(ITEM_BASE, NEXT_SHAPE)}>
        <MoreHorizontal className="size-4" />
      </span>
    </li>
  </ol>
)

const ListBreadcrumb: React.FC<ListBreadcrumbProps> = ({
  accountId,
  folderPath,
  fallbackTitle,
  suffix,
}) => {
  const t = useTranslations('MAILS_LIST')
  const tCommons = useTranslations('MAILS_COMMONS')
  const locale = useLocale()
  const { openFolder } = useOfflineNav()
  const { data: folders, isLoading } = useGetFoldersQuery({ accountId })

  const chain = useMemo(
    () => (folders ? getFolderBreadcrumb(folders, folderPath) : []),
    [folders, folderPath]
  )
  const labelOf = useCallback(
    (folder: ImapFolder): string => {
      const translationKey = getFolderTranslationKey(folder.type)
      return translationKey ? tCommons(translationKey) : folder.name
    },
    [tCommons]
  )
  const labels = useMemo(() => chain.map(labelOf), [chain, labelOf])

  // As many folders as the available width allows (at most 5).
  const { containerRef, measureRef, suffixRef, levelCount } = useBreadcrumbFit(
    labels.join('\n')
  )
  const { leading, hidden, trailing } = useMemo(
    () => collapseBreadcrumb(chain, levelCount),
    [chain, levelCount]
  )

  const handleOpen = useCallback(
    (folder: ImapFolder, label: string) => {
      void openFolder(accountId, folder.path, label)
    },
    [openFolder, accountId]
  )

  // Locale-prefixed url, so new tab / copied links skip the locale redirect.
  const hrefOf = (folder: ImapFolder): string =>
    getPathname({
      locale,
      href: `/u/${accountId}/${encodeURIComponent(folder.path)}`,
    })
  const current = chain[chain.length - 1]
  const renderItem = (folder: ImapFolder) => (
    <BreadcrumbItem
      key={folder.path}
      folder={folder}
      href={hrefOf(folder)}
      label={labelOf(folder)}
      isFirst={folder === chain[0]}
      isCurrent={folder === current}
      onOpen={handleOpen}
    />
  )

  let content: React.ReactNode
  if (isLoading) {
    // Same look as the loaded breadcrumb, so the toolbar does not jump.
    content = (
      <span
        className={cn(ITEM_BASE, 'max-w-[10rem]', FIRST_SHAPE, CURRENT_COLORS)}
      >
        <span className="truncate">{fallbackTitle}</span>
      </span>
    )
  } else if (chain.length === 0) {
    content = (
      <span className="truncate text-lg leading-none font-semibold">
        {fallbackTitle}
      </span>
    )
  } else {
    content = (
      <>
        <TooltipProvider>
          <nav aria-label={t('breadcrumb.string')} className="min-w-0">
            <ol className="flex min-w-0 items-center">
              {leading.map(renderItem)}
              {hidden[0] && (
                <BreadcrumbEllipsis
                  target={hidden[0]}
                  targetHref={hrefOf(hidden[0])}
                  targetLabel={labelOf(hidden[0])}
                  hiddenPath={hidden
                    .map(labelOf)
                    .join(HIDDEN_FOLDERS_SEPARATOR)}
                  onOpen={handleOpen}
                />
              )}
              {trailing.map(renderItem)}
            </ol>
          </nav>
        </TooltipProvider>
        <BreadcrumbMeasure labels={labels} rowRef={measureRef} />
      </>
    )
  }

  return (
    // Takes the free width of the toolbar row; the breadcrumb adapts to it.
    <div
      ref={containerRef}
      className="relative flex min-w-0 flex-1 items-center gap-2 overflow-hidden"
    >
      {content}
      {suffix && (
        <span ref={suffixRef} className="flex shrink-0 items-center">
          {suffix}
        </span>
      )}
    </div>
  )
}

export default memo(ListBreadcrumb)
