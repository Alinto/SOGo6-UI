import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { Link } from '@/lib/i18n/navigation'
import { NavItems } from '@/types'
import { useTranslations } from 'next-intl'
import CollapsedNavMenu from './collapsed-sidebar'
import items from './content'

interface RecursiveNavItemProps {
  item: NavItems
}

function RecursiveNavItem({ item }: RecursiveNavItemProps) {
  const t = useTranslations()
  if (item.items) {
    return (
      <SidebarMenuItem className="group/collapsible">
        <SidebarMenuButton tooltip={t(item.title)}>
          {item.icon && <item.icon />}
          <span>{t(item.title)}</span>
        </SidebarMenuButton>
        <SidebarMenuSub className="border-none">
          {item.items?.map((subItem) =>
            subItem.url ? (
              <SidebarMenuSubItem className="pt-2" key={subItem.title}>
                <Link href={subItem.url}>
                  <SidebarMenuButton>
                    {subItem.icon && <subItem.icon size={24} />}
                    <span>{t(subItem.title)}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuSubItem>
            ) : (
              <RecursiveNavItem key={subItem.title} item={subItem} />
            )
          )}
        </SidebarMenuSub>
      </SidebarMenuItem>
    )
  } else {
    return (
      <SidebarMenuItem key={item.title}>
        <Link href={item.url}>
          <SidebarMenuButton tooltip={t(item.title)}>
            {item.icon && <item.icon />}
            <span>{t(item.title)}</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    )
  }
}

export function Sidebar() {
  return (
    <div>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarMenu>
          {items.map((item) => (
            <RecursiveNavItem key={item.title} item={item} />
          ))}
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup className="hidden group-data-[collapsible=icon]:block">
        <SidebarMenu>
          <CollapsedNavMenu items={items} />
        </SidebarMenu>
      </SidebarGroup>
    </div>
  )
}

export default Sidebar
