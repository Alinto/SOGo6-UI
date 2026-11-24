'use client'

import { fitRailSections } from '@/components/sidebar/fit-rail-sections'
import RailMoreButton from '@/components/sidebar/rail-more-button'
import {
  SidebarGroup,
  SidebarMenu,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { useElementHeight } from '@/hooks/use-element-height'
import { Fragment, type ReactElement } from 'react'

interface IconRailProps {
  /** Entries of each section (keyed elements), in order. */
  sections: ReactElement[][]
  /** Tooltip and accessible name of the "+N" entry, e.g. "3 more calendars". */
  moreLabel: (hiddenCount: number) => string
}

/**
 * Entries of a collapsed sidebar, sections split by a line. Only what fits
 * above the sidebar footer is shown: the rest goes behind a "+N" entry that
 * expands the sidebar. Fills the room left by its parent (a flex column).
 */
function IconRail({ sections, moreLabel }: IconRailProps) {
  const { ref, height } = useElementHeight<HTMLDivElement>()
  const { sections: fitted, hiddenCount } = fitRailSections(sections, height)

  return (
    <SidebarGroup className="min-h-0 flex-1 overflow-hidden group-data-[collapsible=icon]:p-0">
      <div ref={ref} className="min-h-0 flex-1">
        <SidebarMenu>
          {fitted.map((items, index) => (
            <Fragment key={items[0].key ?? index}>
              {index > 0 && (
                // A list holds only items: the line is a hidden one.
                <li aria-hidden="true">
                  <SidebarSeparator className="my-1" />
                </li>
              )}
              {items}
            </Fragment>
          ))}
          {hiddenCount > 0 && (
            <RailMoreButton
              label={moreLabel(hiddenCount)}
              count={hiddenCount}
            />
          )}
        </SidebarMenu>
      </div>
    </SidebarGroup>
  )
}

export default IconRail
