'use client'

import ModuleCreateSplitButton from '@/components/sidebar/module-create-split-button'
import { memo } from 'react'

const CreateEventOpener: React.FC = () => {
  return <ModuleCreateSplitButton primary="calendar" />
}

export default memo(CreateEventOpener)
