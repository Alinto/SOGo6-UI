'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import React, { memo } from 'react'
import { ImapMessagesList } from '../mails-types'

interface MailListItemCheckboxProps {
  isSelected: boolean
  data: ImapMessagesList
  onHandleCheckboxClick: (_e: React.MouseEvent, _item: ImapMessagesList) => void
  wrapperClassName?: string
  checkboxClassName?: string
}

const MailListItemCheckbox: React.FC<MailListItemCheckboxProps> = ({
  isSelected,
  data,
  onHandleCheckboxClick,
  wrapperClassName,
  checkboxClassName,
}) => {
  const t = useTranslations('MAILS_LIST')

  return (
    <span className={cn('shrink-0', wrapperClassName)}>
      <button
        type="button"
        data-testid="mail-list-item-checkbox"
        aria-label={
          isSelected
            ? t('actions.deselect_mail.string')
            : t('actions.select_mail.string')
        }
        className="hover:bg-muted/70 focus-visible:ring-ring relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:ring-1 focus-visible:outline-hidden"
        onClick={(e) => onHandleCheckboxClick(e, data)}
      >
        <Checkbox
          className={cn(
            'pointer-events-none shrink-0 bg-white',
            checkboxClassName
          )}
          checked={isSelected}
          tabIndex={-1}
          aria-hidden
        />
      </button>
    </span>
  )
}

export default memo(MailListItemCheckbox)
