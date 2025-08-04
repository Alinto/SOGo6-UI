import React from 'react'
import { FieldErrors } from 'react-hook-form'
import Tag from '../tag'
import InputWithError from './input-with-error'

interface InputWithTagsProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  tags: { id: string; value: string }[]
  remove: (_index: number) => void
  handleAdd: (_value: string) => void
  errors?: FieldErrors
  name: string
}

const InputWithTags: React.FC<InputWithTagsProps> = ({
  tags,
  remove,
  handleAdd,
  errors,
  name,
  ...props
}) => {
  return (
    <div className="input-with-tag flex flex-wrap rounded-md border-b-1 p-2">
      {tags.map((tag, i) => (
        <Tag
          key={tag.id}
          value={tag.value}
          icon={'trash-2'}
          action={() => remove(i)}
        />
      ))}
      <div className="min-w-96 flex-1">
        <InputWithError
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.currentTarget.value.length) {
              e.preventDefault()
              e.stopPropagation()
              handleAdd(e.currentTarget.value)
            }
          }}
          errors={errors}
          errorName={name}
          {...props}
        />
      </div>
    </div>
  )
}

export default InputWithTags
