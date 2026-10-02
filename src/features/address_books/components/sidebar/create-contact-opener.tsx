'use client'

import ModuleCreateSplitButton from '@/components/sidebar/module-create-split-button'
import { memo } from 'react'

function CreateContactOpener() {
  return <ModuleCreateSplitButton primary="contact" />
}

export default memo(CreateContactOpener)
