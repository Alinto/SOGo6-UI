'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useProfile } from '@/features/user-profile'
import { Paperclip, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'

interface ComposeHeaderProps {
  onClose?: () => void
}

const ComposeHeader: React.FC<ComposeHeaderProps> = ({ onClose }) => {
  const [showCc, setShowCc] = React.useState(false)
  const [showBcc, setShowBcc] = React.useState(false)
  const tCommons = useTranslations('COMMONS')
  const t = useTranslations('COMPOSE')

  const {
    mainAccount,
    externalAccounts,
    defaultIdentity,
    identitiesEnabled,
    customFromEnabled,
    user,
  } = useProfile()

  const allIdentities = [
    ...(mainAccount?.identities ?? []),
    ...externalAccounts.flatMap((acc) => acc.identities),
  ]

  const defaultFrom = defaultIdentity?.mail || user?.email || ''
  const [selectedFrom, setSelectedFrom] = React.useState(defaultFrom)

  React.useEffect(() => {
    if (defaultFrom) setSelectedFrom(defaultFrom)
  }, [defaultFrom])

  const renderFromField = () => {
    if (!identitiesEnabled || allIdentities.length <= 1) {
      return (
        <Input
          value={defaultFrom}
          readOnly
          className="min-w-3xl"
        />
      )
    }

    if (!customFromEnabled) {
      return (
        <Select value={defaultFrom} disabled>
          <SelectTrigger className="min-w-3xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={defaultFrom}>{defaultFrom}</SelectItem>
          </SelectContent>
        </Select>
      )
    }

    return (
      <Select value={selectedFrom} onValueChange={setSelectedFrom}>
        <SelectTrigger className="min-w-3xl">
          <SelectValue placeholder={t('from.string')} />
        </SelectTrigger>
        <SelectContent>
          {allIdentities.map((identity) => (
            <SelectItem key={identity.mail} value={identity.mail}>
              {identity.name
                ? `${identity.name} <${identity.mail}>`
                : identity.mail}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  return (
    <>
      <div className="flex justify-between gap-2">
        <div className="flex items-center gap-2">
          {renderFromField()}
        </div>
        {onClose && (
          <div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-4"
              onClick={onClose}
            >
              <X className="text-muted-foreground h-6 w-6" />
              <span className="sr-only">{tCommons('close.string')}</span>
            </Button>
          </div>
        )}
      </div>
      <div className="mt-2 flex w-full items-center">
        <Input
          placeholder={t('to.string')}
          className="w-full rounded-tr-none rounded-br-none"
        />
        <div className="flex items-center">
          <Button
            variant="outline"
            className={`rounded-none border-r-0 border-l-0 ${showCc ? 'bg-accent text-accent-foreground' : ''}`}
            size={'sm'}
            onClick={() => setShowCc((prev) => !prev)}
          >
            {t('cc.string')}
          </Button>
          <Button
            variant="outline"
            className={`rounded-tl-none rounded-bl-none ${showBcc ? 'bg-accent text-accent-foreground' : ''}`}
            size={'sm'}
            onClick={() => setShowBcc((prev) => !prev)}
          >
            {t('bcc.string')}
          </Button>
        </div>
      </div>
      {showCc && (
        <div className="mt-2 flex w-full items-center">
          <Input className="w-full" />
        </div>
      )}
      {showBcc && (
        <div className="mt-2 flex w-full items-center">
          <Input className="w-full" />
        </div>
      )}
      <div className="mt-2 flex w-full items-center">
        <Input
          placeholder={t('subject.string')}
          className="w-full rounded-tr-none rounded-br-none border-r-0"
        />
        <div className="flex items-center">
          <Button
            variant="outline"
            className="rounded-tl-none rounded-bl-none"
            size={'sm'}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </>
  )
}

export default ComposeHeader
