import { Grid2X2 } from 'lucide-react'
import React from 'react'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../navigation-menu'
import NavigationToggler from './navigation-toggler'

const NavigationMenuToggler: React.FC = () => (
  <NavigationMenu>
    <NavigationMenuList>
      <NavigationMenuItem>
        <NavigationMenuTrigger className="flex w-full">
          <Grid2X2 className="h-7 w-7" size={20} data-sidebar="menu-button" />
        </NavigationMenuTrigger>
        <NavigationMenuContent>
          <NavigationToggler className="flex gap-2" />
        </NavigationMenuContent>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>
)

export default NavigationMenuToggler
