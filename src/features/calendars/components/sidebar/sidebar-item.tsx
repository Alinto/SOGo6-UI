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
import { useIsMobile } from '@/hooks/use-mobile'
import { MoreVertical } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useMemo } from 'react'
import { useCalendarVisibility } from '../../hooks/useCalendarVisibility'
import DeleteAction from './actions/delete'
import LinkAction from './actions/link'
import EditForm from './forms/edit'

interface SidebarItemProps {
  name: string
  id: string
  color?: string
  isDefault?: boolean
  disableActions?: boolean
  icon?: 'calendar'
  onClick: () => void
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  name,
  id,
  color,
  isDefault,
  disableActions,
}) => {
  const [type, setType] = React.useState('')
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const { setCalendarVisibility, isCalendarVisible } = useCalendarVisibility()
  const t = useTranslations('CALENDARS')
  const isMobile = useIsMobile()

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
        className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex h-10 w-full cursor-pointer items-center gap-1 rounded-md px-2 align-middle transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-none"
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
        <span className="truncate text-sm group-data-[collapsible=icon]:hidden">
          {name}
        </span>
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
            {type === 'delete' && <DeleteAction id={id} />}
            {type === 'link' && <LinkAction id={id} />}
          </DialogContent>
        </Dialog>
      )}
    </SidebarMenuItem>
  )
}

export default SidebarItem
