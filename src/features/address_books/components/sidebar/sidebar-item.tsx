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
import { useIsMobile } from '@/hooks/use-mobile'
import { useRouter } from '@/lib/i18n/navigation'
import { MoreVertical } from 'lucide-react'
import { DynamicIcon, IconName } from 'lucide-react/dynamic'
import { useTranslations } from 'next-intl'
import React from 'react'
import DeleteAction from './actions/delete'
import LinkAction from './actions/link'
import EditForm from './forms/edit'
import ImportDialog from './actions/import-dialog'
import ExportDialog from './actions/export-dialog'
import WorkInProgress from '@/components/work-in-progress'

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
  writable?: boolean
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
  sharingAction = false,
  linkAction = true,
  exportAction = true,
  downloadAction = false,
  writable = true,
}) => {
  const [type, setType] = React.useState('')
  const t = useTranslations('ADDRESS_BOOKS_SIDEBAR')
  const formT = useTranslations('FORM_COMMONS')
  const { push } = useRouter()
  const isMobile = useIsMobile()
  
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
        <Dialog
          open={type !== ''}
          onOpenChange={(open) => !open && setType('')}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuAction className="h-7 cursor-pointer">
                <MoreVertical />
              </SidebarMenuAction>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side={isMobile ? 'bottom' : 'right'}
              align={isMobile ? 'center' : 'start'}
            >
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
                    <span>{t('options.link.title.string')}</span>
                  </DropdownMenuItem>
                </DialogTrigger>
              )}
              <DropdownMenuSeparator />
              {sharingAction && (
                <DialogTrigger asChild>
                  <DropdownMenuItem onClick={() => setType('sharing')}>
                    <span>{t('options.sharing.string')}</span>
                  </DropdownMenuItem>
                </DialogTrigger>
              )}
              <DropdownMenuSeparator />
              {importAction && writable && (
                <DialogTrigger asChild>
                  <DropdownMenuItem onClick={() => setType('import')}>
                    <span>{t('options.import.string')}</span>
                  </DropdownMenuItem>
                </DialogTrigger>
              )}
              {exportAction && writable && (
                <DialogTrigger asChild>
                  <DropdownMenuItem onClick={() => setType('export')}>
                    <span>{t('options.export.string')}</span>
                  </DropdownMenuItem>
                </DialogTrigger>
              )}
              {downloadAction && (
                <DialogTrigger asChild>
                  <DropdownMenuItem onClick={() => setType('download')}>
                    <span>{t('options.ios_download.string')}</span>
                  </DropdownMenuItem>
                </DialogTrigger>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <DialogContent>
            {type === 'edit' && (
              <EditForm id={id} name={name} onSuccess={() => setType('')} />
            )}
            {type === 'delete' && <DeleteAction id={id} name={name} />}
            {type === 'link' && <LinkAction id={id} name={name} />}
            {type === 'sharing' && (
              <WorkInProgress title={t('options.sharing.string')} />
            )}
            {type === 'import' && (
              <ImportDialog
                bookId={id}
                bookName={name}
                onSuccess={() => setType('')}
              />
            )}
            {type === 'export' && (
              <ExportDialog
                bookId={id}
                bookName={name}
                onSuccess={() => setType('')}
              />
            )}
            {type === 'download' && (
              <WorkInProgress title={t('options.ios_download.string')} />
            )}
          </DialogContent>
        </Dialog>
      )}
    </SidebarMenuItem>
  )
}

export default SidebarItem
