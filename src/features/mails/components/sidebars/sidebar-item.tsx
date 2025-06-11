import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenuAction, SidebarMenuButton } from '@/components/ui/sidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import { MoreVertical } from 'lucide-react'
import { DynamicIcon, IconName } from 'lucide-react/dynamic'
import { useTranslations } from 'next-intl'
import React from 'react'

interface SidebarItemProps {
  name: string
  id: string
  disableActions?: boolean
  editAction?: boolean
  importAction?: boolean
  sharingAction?: boolean
  linkAction?: boolean
  exportAction?: boolean
  downloadAction?: boolean
  icon?: IconName
  isActive?: boolean
  isDefault?: boolean
  handleClick: () => void
  collapsible?: boolean
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}

/**
 * SidebarItem component renders an interactive item for the sidebar menu,
 * displaying an icon and label, and optionally providing a dropdown menu
 * with additional actions such as renaming, marking as read, creating a subfolder,
 * and sharing. It supports both desktop and mobile layouts, and can be customized
 * via props for active state, disabling actions, and handling click events.
 *
 * @param {SidebarItemProps} props - The properties for the SidebarItem component.
 * @param {string} props.name - The display name of the sidebar item.
 * @param {string} [props.icon] - The name of the icon to display.
 * @param {boolean} [props.disableActions] - If true, disables the dropdown actions menu.
 * @param {boolean} [props.isActive] - If true, highlights the item as active.
 * @param {(e?: React.MouseEvent) => void} [props.handleClick] - Handler for main item click.
 * @param {(e: React.MouseEvent) => void} [props.onClick] - Optional handler for icon button click.
 * @param {...any} props - Additional props are spread to the icon button.
 *
 * @returns {JSX.Element} The rendered sidebar item component.
 */
const SidebarItem: React.FC<SidebarItemProps> = ({
  name,
  icon,
  disableActions,
  isActive,
  isDefault,
  handleClick,
  // onClick is used to handle clicks on the icon button for collapsible items only
  onClick,
  ...props
}) => {
  const [type, setType] = React.useState('')
  const t = useTranslations('Mails')
  const isMobile = useIsMobile()
  return (
    <>
      <SidebarMenuButton
        className={`h-10 align-middle ${!isDefault ? 'group-data-[collapsible=icon]:hidden' : ''} group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-none`}
        tooltip={name}
        isActive={isActive}
        onClick={handleClick}
        title={name}
      >
        {icon && (
          <div
            className={`z-50 mr-2 h-5 w-5 p-0 group-data-[collapsible=icon]:visible group-data-[collapsible=icon]:pl-1 ${onClick ? '[&[data-state=open]>svg:first-child]:rotate-90' : ''}`}
            data-collapsible="icon"
            data-state="open"
            onClick={(e) => {
              e.stopPropagation()
              if (onClick) {
                onClick(e)
              } else {
                handleClick()
              }
            }}
            {...props}
          >
            <DynamicIcon
              className="h-5 w-5 transition-transform data-[state=open]:rotate-90"
              name={icon}
            />
          </div>
        )}
        <span className="w-9/12 truncate group-data-[collapsible=icon]:hidden">
          {name}
        </span>
      </SidebarMenuButton>

      {!disableActions && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuAction dataSidebar={`menu-button-${name}`} showOnHover>
              <MoreVertical />
            </SidebarMenuAction>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align={isMobile ? 'end' : 'start'}
          >
            <DropdownMenuItem onClick={() => setType('edit')}>
              <span>{t('options.rename.string')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setType('delete')}>
              <span>{t('options.mark_as_read.string')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setType('link')}>
              <span>{t('options.new_subfolder.string')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setType('sharing')}>
              <span>{t('options.sharing.string')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  )
}

export default SidebarItem
