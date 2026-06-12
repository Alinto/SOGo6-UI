import { memo } from 'react'

import {
  tasksOverdueCountBadgeClassName,
  tasksOverdueCountBadgeLabelClassName,
} from './sidebar/sidebar-menu-button-classes'

function TaskOverdueCountBadge({ count }: { count: number }) {
  if (count <= 0) return null

  return (
    <span className={tasksOverdueCountBadgeClassName} aria-hidden>
      <span className={tasksOverdueCountBadgeLabelClassName}>{count}</span>
    </span>
  )
}

export default memo(TaskOverdueCountBadge)
