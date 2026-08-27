import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenuAction, SidebarMenuItem } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import {
  useGetSyncStatusQuery,
  useTriggerSyncMutation,
} from '@/features/calendars/store/calendars-api'
import { useIsMobile } from '@/hooks/use-mobile'
import { useProfile } from '@/features/user-profile'
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
import {
  isPersonalCalendar,
  isSubscriptionCalendar,
} from '../../utils/calendar-source-type'
import DeleteAction from './actions/delete'
import LinkAction from './actions/link'
import ShareCalendarAction from './actions/share'
import EditForm from './forms/edit'
import WorkInProgress from '@/components/work-in-progress'
import { useCalendarVisibility } from '../../hooks/useCalendarVisibility'

interface SidebarItemProps {
  name: string
  id: string
  color?: string
  isDefault?: boolean
  disableActions?: boolean
  icon?: 'calendar'
  sourceType?: string
  calendarKey?: string
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
  const isRunning =
    isMutationLoading || syncStatus?.sync_status === 'running'

  const statusIcon = () => {
    if (isRunning) {
      return <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
    }
    if (syncStatus?.sync_status === 'failed') {
      return (
        <AlertTriangle className="text-destructive h-3 w-3 shrink-0" />
      )
    }
    if (syncStatus?.sync_status === 'completed') {
      return <CheckCircle2 className="h-3 w-3 shrink-0 text-green-500" />
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
}) => {
  const [type, setType] = React.useState('')
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const { setCalendarVisibility, isCalendarVisible } = useCalendarVisibility()
  const { folderSharingDisabled } = useProfile()
  const t = useTranslations('CALENDARS')
  const isMobile = useIsMobile()
  const isIcs = sourceType === 'ics' && Boolean(calendarKey)
  const isReadOnly = isSubscriptionCalendar({ source_type: sourceType })
  const resolvedCalendarKey = calendarKey ?? id
  const canShareCalendar =
    isPersonalCalendar({ source_type: sourceType }) &&
    !folderSharingDisabled.includes('calendar')

  const handleCheckboxChange = (checked: boolean) => {
    setCalendarVisibility(id, checked)
  }

  const isVisible = useMemo(
    () => isCalendarVisible(id),
    [id, isCalendarVisible]
  )

  return (
    <SidebarMenuItem>
      <div
        onClick={() => handleCheckboxChange(!isVisible)}
        className={cn(
          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex h-10 w-full cursor-pointer items-center gap-1 rounded-md px-2 align-middle transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-none',
          !disableActions && 'pr-8'
        )}
      >
        <div onClick={(e) => e.stopPropagation()} className="flex items-center">
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
        <div className="flex min-w-0 flex-1 items-center gap-1.5 group-data-[collapsible=icon]:hidden">
          <span className="min-w-0 truncate text-sm">{name}</span>
          {isReadOnly && (
            <Lock
              className="text-muted-foreground h-3 w-3 shrink-0"
              aria-label={t('sidebar.readOnlyCalendar.string')}
            />
          )}
          {isIcs && (
            <InlineSyncStatusIcon
              calendarKey={resolvedCalendarKey}
              sourceType={sourceType}
            />
          )}
        </div>
      </div>
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
