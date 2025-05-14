// 'use client'
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible'

interface RecursiveNavItemProps {
  item: NavItems
  translationsKey: string
}

function RecursiveNavItem({ item, translationsKey }: RecursiveNavItemProps) {
  const t = useTranslations(translationsKey)

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
                  <RecursiveNavItem
                    item={subItem}
                    translationsKey={translationsKey}
                  />
                )}
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

export function NavBar({
  items,
  translationsKey,
}: {
  items: NavItems[]
  translationsKey: string
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:visible">
      <SidebarMenu>
        {items.map((item) => (
          <RecursiveNavItem
            key={item.title}
            item={item}
            translationsKey={translationsKey}
          />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
