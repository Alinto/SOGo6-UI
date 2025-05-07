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
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useRouter } from '@/lib/i18n/navigation'
import { MoreVertical } from 'lucide-react'
import { DynamicIcon, IconName } from 'lucide-react/dynamic'
import { useTranslations } from 'next-intl'
import React from 'react'
import DeleteAction from './actions/delete'
import LinkAction from './actions/link'
import EditForm from './forms/edit'

interface SidebarItemProps {
  name: string
  id: string
  isDefault?: boolean
  disableActions?: boolean
  editAction?: boolean
  importAction?: boolean
  sharingAction?: boolean
  linkAction?: boolean
  exportAction?: boolean
  downloadAction?: boolean
  icon?: IconName
  onClick: () => void
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  name,
  icon,
  disableActions,
  isDefault,
  id,
  editAction = true,
  importAction = true,
  sharingAction = true,
  linkAction = true,
  exportAction = true,
  downloadAction = true,
}) => {
  const [type, setType] = React.useState('')
  const formT = useTranslations('Form')
  const t = useTranslations('Address_Books')
  const { push } = useRouter()
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className="h-10 align-middle group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-none"
        onClick={() => push(`/address_books/${id}`)}
        tooltip={name}
      >
        {icon && <DynamicIcon name={icon} />}
        <span className="truncate group-data-[collapsible=icon]:hidden">
          {name}
        </span>
      </SidebarMenuButton>
      {!disableActions && (
        <Dialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuAction className="h-7">
                <MoreVertical />
              </SidebarMenuAction>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start">
              {editAction && (
                <DialogTrigger asChild>
                  <DropdownMenuItem onClick={() => setType('edit')}>
                    <span>{formT('edit.default.string')}</span>
                  </DropdownMenuItem>
                </DialogTrigger>
              )}

              {!isDefault && (
                <DialogTrigger asChild>
                  <DropdownMenuItem onClick={() => setType('delete')}>
                    <span>{formT('delete.default.string')}</span>
                  </DropdownMenuItem>
                </DialogTrigger>
              )}
              <DropdownMenuSeparator />
              {linkAction && (
                <DialogTrigger asChild>
                  <DropdownMenuItem onClick={() => setType('link')}>
                    <span>{t('sidebar.options.link.title.string')}</span>
                  </DropdownMenuItem>
                </DialogTrigger>
              )}
              <DropdownMenuSeparator />
              {sharingAction && (
                <DialogTrigger asChild>
                  <DropdownMenuItem onClick={() => setType('sharing')}>
                    <span>{t('sidebar.options.sharing.string')}</span>
                  </DropdownMenuItem>
                </DialogTrigger>
              )}
              <DropdownMenuSeparator />
              {importAction && (
                <DialogTrigger asChild>
                  <DropdownMenuItem onClick={() => setType('import')}>
                    <span>{t('sidebar.options.import.string')}</span>
                  </DropdownMenuItem>
                </DialogTrigger>
              )}
              {exportAction && (
                <DropdownMenuItem>
                  <span>{t('sidebar.options.export.string')}</span>
                </DropdownMenuItem>
              )}
              {downloadAction && (
                <DropdownMenuItem>
                  <span>{t('sidebar.options.ios_download.string')}</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <DialogContent>
            {type === 'edit' && <EditForm id={id} name={name} />}
            {type === 'delete' && <DeleteAction id={id} name={name} />}
            {type === 'link' && <LinkAction id={id} name={name} />}
            {type === 'sharing' && <div>Sharing</div>}
            {type === 'import' && <div>Import</div>}
          </DialogContent>
        </Dialog>
      )}
    </SidebarMenuItem>
  )
}

export default SidebarItem
