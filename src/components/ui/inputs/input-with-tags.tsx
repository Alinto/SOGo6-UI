import React from 'react'
import { FieldErrors } from 'react-hook-form'
import Tag from '../tag'
import InputWithError from './input-with-error'

interface InputWithTagsProps {
  tags: { id: string; value: string }[]
  remove: (index: number) => void
  handleAdd: (value: string) => void
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  errors?: FieldErrors
  name: string
}

const InputWithTags: React.FC<InputWithTagsProps> = ({
  tags,
  remove,
  handleAdd,
  placeholder,
  errors,
  name,
  ...props
}) => {
  return (
    <div className="input-with-tag border-b-1 rounded-md p-2 flex flex-wrap">
      {tags.map((tag, i) => (
        <Tag
          key={tag.id}
          value={tag.value}
          icon={'trash-2'}
          action={() => remove(i)}
        />
      ))}
      <div className="flex-1 min-w-96">
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
          placeholder={placeholder}
          {...props}
        />
      </div>
    </div>
  )
}

export default InputWithTags
