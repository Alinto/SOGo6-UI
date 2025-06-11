import { useHover } from '@/hooks/useHover'
import { Grid2X2 } from 'lucide-react'
import React, { useRef } from 'react'
import { Button } from '../button'
import { Popover, PopoverContent, PopoverTrigger } from '../popover'
import NavigationToggler from './navigation-toggler'

const NavigationMenuToggler: React.FC = () => {
  const navigationRef = useRef<HTMLButtonElement>(null)
  const isNavigationHovered = useHover(navigationRef)

  return (
    <Popover open={isNavigationHovered}>
      <PopoverTrigger asChild>
        <Button aria-label="Open menu" className="p-0" ref={navigationRef}>
          <Grid2X2 className="h-7 w-7" size={20} data-sidebar="menu-button" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-fit p-0">
        <NavigationToggler className="flex gap-2" />
      </PopoverContent>
    </Popover>
  )
}

export default NavigationMenuToggler
