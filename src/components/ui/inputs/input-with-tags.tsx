import { cn } from '@/lib/utils'
import React from 'react'
import { FieldErrors } from 'react-hook-form'
import Tag from '../tag'
import InputWithError from './input-with-error'

interface InputWithTagsProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // `label` is what the tag shows, `tooltip`/`details` what it reveals on
  // hover/tap.
  tags: {
    id: string
    value: string
    label?: string
    tooltip?: string
    details?: React.ReactNode
  }[]
  remove: (_index: number) => void
  handleAdd: (_value: string) => void
  errors?: FieldErrors
  name: string
  containerClassName?: string
}

const InputWithTags: React.FC<InputWithTagsProps> = ({
  tags,
  remove,
  handleAdd,
  errors,
  name,
  containerClassName,
  ...props
}) => {
  return (
    <div
      className={cn(
        'input-with-tag border-input flex flex-wrap items-center gap-2 rounded-md border px-2',
        containerClassName
      )}
    >
      {tags.map((tag, i) => (
        <Tag
          key={tag.id}
          value={tag.label ?? tag.value}
          tooltip={tag.tooltip ?? tag.label ?? tag.value}
          details={tag.details}
          icon={'trash-2'}
          action={() => remove(i)}
        />
      ))}
      <div className="min-w-32 flex-1">
        <InputWithError
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.currentTarget.value.length) {
              e.preventDefault()
              e.stopPropagation()
              handleAdd(e.currentTarget.value)
              e.currentTarget.value = ''
            }
          }}
          errors={errors}
          errorName={name}
          className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          {...props}
        />
      </div>
    </div>
  )
}

export default InputWithTags
