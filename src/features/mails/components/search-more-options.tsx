import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useTranslations } from 'next-intl'
import React from 'react'

const SearchMoreOptions: React.FC = () => {
  const t = useTranslations('MAILS_COMMONS')
  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <Label htmlFor="from">{t('from.string')}</Label>
          <Input id="from" className="w-full" />
        </div>
        <div>
          <Label htmlFor="to">{t('to.string')}</Label>
          <Input id="to" className="w-full" />
        </div>
        <div>
          <Label htmlFor="bcc">{t('bcc.string')}</Label>
          <Input id="bcc" className="w-full" />
        </div>
        {/* <div>
        <Label htmlFor="contains">Contains</Label>
        <Input id="contains" className="w-full" />
      </div>
      <div>
        <Label htmlFor="not-contains">Does not contain</Label>
        <Input id="not-contains" className="w-full" />
      </div> */}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="subject">{t('subject.string')}</Label>
          <Input id="subject" className="w-full" />
        </div>
        <div>
          <Label htmlFor="body">{t('search.body.string')}</Label>
          <Input id="body" className="w-full" />
        </div>
      </div>
      <Separator className="my-4" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-2">
        <div className="flex items-center space-x-2">
          <Checkbox id="with-attachments" />
          <Label htmlFor="with-attachments">
            {t('search.with_attachments.string')}
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="in-favorites" />
          <Label htmlFor="in-favorites">
            {t('search.in_favorites.string')}
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="unseen-only" />
          <Label htmlFor="unseen-only">{t('search.unseen_only.string')}</Label>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-2">
        <div>
          <Label htmlFor="from">{t('search.date_from.string')}</Label>
          <Input id="from" className="w-full" />
        </div>
        <div>
          <Label htmlFor="to">{t('search.date_to.string')}</Label>
          <Input id="to" className="w-full" />
        </div>
      </div>
    </>
  )
}

export default SearchMoreOptions
