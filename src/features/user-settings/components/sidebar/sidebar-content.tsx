// 'use client'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
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
import { ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import CollapsedNavMenu from './collapsed-sidebar'
import items from './content'

interface RecursiveNavItemProps {
  item: NavItems
}

function RecursiveNavItem({ item }: RecursiveNavItemProps) {
  const t = useTranslations('User_Settings')

  return (
    <Collapsible
      key={item.title}
      asChild
      defaultOpen={item.isActive}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger className="text-sm" asChild>
          <SidebarMenuButton tooltip={t(item.title)}>
            {item.icon && <item.icon />}
            <span>{t(item.title)}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items?.map((subItem) => (
              <SidebarMenuSubItem className="pt-2" key={subItem.title}>
                {subItem.url ? (
                  <Link href={subItem.url}>
                    <SidebarMenuButton>
                      {subItem.icon && <subItem.icon size={24} />}
                      <span>{t(subItem.title)}</span>
                    </SidebarMenuButton>
                  </Link>
                ) : (
                  <RecursiveNavItem item={subItem} />
                )}
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
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
