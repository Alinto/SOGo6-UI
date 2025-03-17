import { cn } from '@/lib/utils'
import { DynamicIcon, type IconName } from 'lucide-react/dynamic'
import React from 'react'
import { Button } from './button'

interface TagProps {
  value: string
  icon?: IconName
  action?: () => void
  className?: string
}

const Tag: React.FC<TagProps> = ({ value, action, icon, className }) => {
  return (
    <div
      className={cn(
        'tag rounded-full h-9 bg-gray-100 text-sm flex items-center pl-4 space-x-1',
        !icon ? 'pr-4' : '',
        className
      )}
    >
      {value}
      {icon && (
        <Button
          type="button"
          variant={'ghost'}
          size={'icon'}
          onClick={() => action && action()}
        >
          <DynamicIcon size="18" name={icon} />
        </Button>
      )}
    </div>
  )
}

export default Tag
