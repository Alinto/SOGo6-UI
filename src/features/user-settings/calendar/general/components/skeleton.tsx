'use client'
import { ButtonSkeleton } from '@/components/ui/skeletons/buttons'
import InputSkeleton from '@/components/ui/skeletons/inputs'
import React from 'react'

const LabelsFormSkeleton: React.FC = () => {
  return (
    <div className="p-4">
      <ButtonSkeleton size="default" className="mb-4" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex items-center gap-4">
          <InputSkeleton />
          <ButtonSkeleton size="icon" />
        </div>
        <div className="flex items-center gap-4">
          <InputSkeleton />
          <ButtonSkeleton size="icon" />
        </div>
        <div className="flex items-center gap-4">
          <InputSkeleton />
          <ButtonSkeleton size="icon" />
        </div>
        <div className="flex items-center gap-4">
          <InputSkeleton />
          <ButtonSkeleton size="icon" />
        </div>
      </div>
    </div>
  )
}

export default LabelsFormSkeleton
