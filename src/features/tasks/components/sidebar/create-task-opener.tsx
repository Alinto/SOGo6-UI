'use client'

import ModuleCreateSplitButton from '@/components/sidebar/module-create-split-button'
import { memo } from 'react'

function CreateTaskOpener() {
  return <ModuleCreateSplitButton primary="task" />
}

export default memo(CreateTaskOpener)
