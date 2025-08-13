import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { NavItems } from '@/types'
import { useTranslations } from 'next-intl'

function RecursiveNav({ items }: { items: NavItems[] }) {
  const t = useTranslations()

  return (
    <>
      {items.map((section) =>
        section.items ? (
          <NavigationMenu
            key={section.title}
            delayDuration={100}
            orientation="vertical"
          >
            <NavigationMenuList className="flex flex-col">
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent dark:focus:bg-transparent">
                  {section.icon && <section.icon className="mr-2" />}
                  {!section.icon && t(section.title)}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="z-50 bg-inherit">
                  <NavigationMenu viewport>
                    <NavigationMenuList className="relative flex flex-col">
                      <RecursiveNav items={section.items} />
                    </NavigationMenuList>
                  </NavigationMenu>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        ) : (
          <NavigationMenu
            key={section.title}
            delayDuration={100}
            orientation="vertical"
          >
            <NavigationMenuItem key={section.title}>
              <NavigationMenuLink
                href={section.url || '#'}
                className="list-none"
              >
                <span className="flex items-center">
                  {section.icon && <section.icon className="mr-2" />}
                  {!section.icon && t(section.title)}
                </span>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenu>
        )
      )}
    </>
  )
}

function CollapsedNavMenu({ items }: { items: NavItems[] }) {
  const flattedItems = items.flatMap((section) =>
    section.items ? section.items : section
  )
  return <RecursiveNav items={flattedItems} />
}

export default CollapsedNavMenu
