'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useRouter } from '@/lib/i18n/navigation'
import { Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import React, { memo } from 'react'
import type { VCard } from '../../address-books-types'
import {
  getDistributionListMemberCount,
  getDistributionListName,
  getMemberDisplayLabel,
} from '../../utils/distribution-list'
import DistributionListActions from './distribution-list-actions'

interface DistributionListVisualizationProps {
  data: VCard
}

function DistributionListVisualization({
  data,
}: DistributionListVisualizationProps) {
  const t = useTranslations('DISTRIBUTION_LIST_FORM')
  const { push } = useRouter()
  const { book_id } = useParams()
  const bookId = book_id as string
  const memberCount = getDistributionListMemberCount(data)

  const handleMemberClick = (contactId?: string) => {
    if (!contactId || !bookId) return
    push(`/address_books/${bookId}/${contactId}`)
  }

  return (
    <Card className="flex h-full w-full min-w-0 flex-col overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
            <Avatar className="h-14 w-14 shrink-0 sm:h-16 sm:w-16 xl:h-20 xl:w-20">
              <AvatarFallback className="bg-primary/10 text-primary">
                <Users className="h-6 w-6 xl:h-8 xl:w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h1 className="text-foreground min-w-0 truncate text-xl font-semibold sm:text-2xl xl:text-3xl">
                  {getDistributionListName(data)}
                </h1>
                <Badge variant="secondary" className="shrink-0">
                  {t('list_badge.string')}
                </Badge>
              </div>
              <p className="text-muted-foreground truncate text-sm">
                {t('member_count.string', { number: memberCount })}
              </p>
            </div>
          </div>
          <div className="flex w-full min-w-0 shrink-0 flex-wrap items-center gap-2 xl:w-auto">
            <DistributionListActions list={data} bookId={bookId} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex min-w-0 flex-1 flex-col gap-6 overflow-y-auto">
        {data.note && (
          <section className="space-y-2">
            <h2 className="text-foreground text-base font-semibold sm:text-lg">
              {t('fields.note.string')}
            </h2>
            <p className="text-muted-foreground text-sm whitespace-pre-wrap">
              {data.note}
            </p>
          </section>
        )}

        <section aria-labelledby="members-heading" className="space-y-3">
          <Separator />
          <h2
            id="members-heading"
            className="text-foreground text-base font-semibold sm:text-lg"
          >
            {t('members.string')}
          </h2>
          {memberCount === 0 ? (
            <p className="text-muted-foreground text-sm">{t('no_members.string')}</p>
          ) : (
            <ul className="space-y-1">
              {(data.members ?? []).map((member, index) => {
                const label = getMemberDisplayLabel(member)
                const isClickable = Boolean(member.contactId)
                return (
                  <li key={`${member.email}-${index}`}>
                    <button
                      type="button"
                      className="hover:bg-accent/50 flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors disabled:cursor-default"
                      onClick={() => handleMemberClick(member.contactId)}
                      disabled={!isClickable}
                    >
                      <span className="font-medium">{label}</span>
                      <span className="text-muted-foreground truncate pl-3 text-xs">
                        {member.email}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </CardContent>
    </Card>
  )
}

export default memo(DistributionListVisualization)
