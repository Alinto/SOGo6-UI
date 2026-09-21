import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenuAction,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import WorkInProgress from '@/components/work-in-progress'
import {
  useGetSyncStatusQuery,
  useTriggerSyncMutation,
} from '@/features/calendars/store/calendars-api'
import { useProfile } from '@/features/user-profile'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Lock,
  MoreVertical,
  RefreshCw,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { memo, useMemo } from 'react'
import { useCalendarVisibility } from '../../hooks/useCalendarVisibility'
import {
  isPersonalCalendar,
  isSubscriptionCalendar,
} from '../../utils/calendar-source-type'
import DeleteAction from './actions/delete'
import LinkAction from './actions/link'
import ShareCalendarAction from './actions/share'
import EditForm from './forms/edit'

interface SidebarItemProps {
  name: string
  id: string
  color?: string
  isDefault?: boolean
  disableActions?: boolean
  icon?: 'calendar'
  sourceType?: string
  calendarKey?: string
  /** Owner email, displayed next to the name of a shared calendar. */
  owner?: string
  /** Calendar owned by someone else and shared with the connected user. */
  isShared?: boolean
  onClick: () => void
}

function useExternalSyncVisuals(
  calendarKey: string,
  sourceType: string | undefined,
  isMutationLoading: boolean
) {
  const isSubscription = sourceType
    ? isSubscriptionCalendar({ source_type: sourceType })
    : false
  const { data: syncStatus } = useGetSyncStatusQuery(calendarKey, {
    skip: !calendarKey || !isSubscription,
  })
  const isRunning = isMutationLoading || syncStatus?.sync_status === 'running'

  const statusIcon = () => {
    if (isRunning) {
      return <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
    }
    if (syncStatus?.sync_status === 'failed') {
      return <AlertTriangle className="text-destructive h-3 w-3 shrink-0" />
    }
    if (syncStatus?.sync_status === 'completed') {
      return <CheckCircle2 className="text-success h-3 w-3 shrink-0" />
    }
    return <RefreshCw className="h-3 w-3 shrink-0 opacity-60" />
  }

  return { syncStatus, isRunning, statusIcon }
}

const SyncNowItem = ({
  calendarKey,
  sourceType,
}: {
  calendarKey: string
  sourceType?: string
}) => {
  const t = useTranslations('CALENDARS')
  const [triggerSync, { isLoading }] = useTriggerSyncMutation()
  const { isRunning, statusIcon } = useExternalSyncVisuals(
    calendarKey,
    sourceType,
    isLoading
  )

  return (
    <DropdownMenuItem
      disabled={isRunning}
      onClick={(e) => {
        e.stopPropagation()
        void triggerSync(calendarKey)
      }}
    >
      {statusIcon()}
      <span>{t('external.sync_now.string')}</span>
    </DropdownMenuItem>
  )
}

const InlineSyncStatusIcon = ({
  calendarKey,
  sourceType,
}: {
  calendarKey: string
  sourceType?: string
}) => {
  const { statusIcon } = useExternalSyncVisuals(calendarKey, sourceType, false)
  return (
    <span className="shrink-0" aria-hidden>
      {statusIcon()}
    </span>
  )
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  name,
  id,
  color,
  isDefault,
  disableActions,
  sourceType,
  calendarKey,
  owner,
  isShared,
}) => {
  const [type, setType] = React.useState('')
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const { setCalendarVisibility, isCalendarVisible } = useCalendarVisibility()
  const { folderSharingDisabled } = useProfile()
  const t = useTranslations('CALENDARS')
  const isMobile = useIsMobile()
  const { state: sidebarState } = useSidebar()
  const isIcs = sourceType === 'ics' && Boolean(calendarKey)
  const isReadOnly = isSubscriptionCalendar({ source_type: sourceType })
  const resolvedCalendarKey = calendarKey ?? id
  const canShareCalendar =
    !isShared &&
    isPersonalCalendar({ source_type: sourceType }) &&
    !folderSharingDisabled.includes('calendar')
  const sharedOwner = isShared && owner ? owner : null
  const fullLabel = sharedOwner ? `${name} - ${sharedOwner}` : name

  const handleCheckboxChange = (checked: boolean) => {
    setCalendarVisibility(id, checked)
  }

  const isVisible = useMemo(
    () => isCalendarVisible(id),
    [id, isCalendarVisible]
  )

  return (
    <SidebarMenuItem>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            onClick={() => handleCheckboxChange(!isVisible)}
            title={sidebarState === 'collapsed' ? undefined : fullLabel}
            className={cn(
              'hover:bg-sidebar-foreground/10 hover:text-sidebar-accent-foreground flex w-full cursor-pointer gap-2.5 rounded-md px-2 align-middle transition-colors group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-none',
              // With an owner line, the row grows and the checkbox stays
              // centered on the whole text block
              sharedOwner
                ? 'min-h-10 items-center py-1 group-data-[collapsible=icon]:h-10'
                : 'h-10 items-center',
              !disableActions && 'pr-8'
            )}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center"
            >
              <Checkbox
                checked={isVisible}
                onCheckedChange={handleCheckboxChange}
                className="cursor-pointer"
                style={
                  isVisible && color
                    ? { backgroundColor: color, borderColor: color }
                    : color
                      ? { borderColor: color }
                      : {}
                }
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col group-data-[collapsible=icon]:hidden">
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="min-w-0 truncate text-sm" title={name}>
                  {name}
                </span>
                {isReadOnly && (
                  <Lock
                    className="text-muted-foreground h-3 w-3 shrink-0"
                    aria-label={t('sidebar.readOnlyCalendar.string')}
                  >
                    <title>{t('sidebar.readOnlyCalendar.string')}</title>
                  </Lock>
                )}
                {isIcs && (
                  <InlineSyncStatusIcon
                    calendarKey={resolvedCalendarKey}
                    sourceType={sourceType}
                  />
                )}
              </div>
              {sharedOwner && (
                <span
                  className="truncate text-xs leading-tight opacity-85"
                  title={sharedOwner}
                >
                  {sharedOwner}
                </span>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          hidden={sidebarState !== 'collapsed' || isMobile}
        >
          {fullLabel}
        </TooltipContent>
      </Tooltip>
      {!disableActions && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuAction className="h-7">
                <MoreVertical />
              </SidebarMenuAction>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side={isMobile ? 'bottom' : 'right'}
              align={isMobile ? 'center' : 'start'}
            >
              {isIcs && (
                <>
                  <SyncNowItem
                    calendarKey={resolvedCalendarKey}
                    sourceType={sourceType}
                  />
                  <DropdownMenuSeparator />
                </>
              )}
              <DialogTrigger asChild>
                <DropdownMenuItem
                  onClick={() => {
                    setType('edit')
                    setDialogOpen(true)
                  }}
                >
                  <span>{t('sidebar.edit.string')}</span>
                </DropdownMenuItem>
              </DialogTrigger>

              {!isDefault && (
                <DialogTrigger asChild>
                  <DropdownMenuItem
                    onClick={() => {
                      setType('delete')
                      setDialogOpen(true)
                    }}
                  >
                    <span>{t('sidebar.delete.string')}</span>
                  </DropdownMenuItem>
                </DialogTrigger>
              )}

              <DropdownMenuSeparator />

              <DialogTrigger asChild>
                <DropdownMenuItem
                  onClick={() => {
                    setType('link')
                    setDialogOpen(true)
                  }}
                >
                  <span>{t('sidebar.link.string')}</span>
                </DropdownMenuItem>
              </DialogTrigger>

              {canShareCalendar && (
                <DialogTrigger asChild>
                  <DropdownMenuItem
                    onClick={() => {
                      setType('sharing')
                      setDialogOpen(true)
                    }}
                  >
                    <span>{t('sidebar.sharing.string')}</span>
                  </DropdownMenuItem>
                </DialogTrigger>
              )}

              <DropdownMenuSeparator />

              <DialogTrigger asChild>
                <DropdownMenuItem
                  onClick={() => {
                    setType('export')
                    setDialogOpen(true)
                  }}
                >
                  <span>{t('sidebar.export.string')}</span>
                </DropdownMenuItem>
              </DialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl">
            {type === 'edit' && (
              <EditForm
                id={id}
                name={name}
                color={color}
                onClose={() => setDialogOpen(false)}
              />
            )}
            {type === 'delete' && (
              <DeleteAction
                id={id}
                sourceType={sourceType}
                onClose={() => setDialogOpen(false)}
              />
            )}
            {type === 'link' && <LinkAction id={id} />}
            {type === 'sharing' && (
              <ShareCalendarAction
                id={id}
                calendarKey={resolvedCalendarKey}
                name={name}
                onClose={() => setDialogOpen(false)}
              />
            )}
            {type === 'export' && (
              <WorkInProgress title={t('sidebar.export.string')} />
            )}
          </DialogContent>
        </Dialog>
      )}
    </SidebarMenuItem>
  )
}

export default memo(SidebarItem)
