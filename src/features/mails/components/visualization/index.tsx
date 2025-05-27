import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useTranslations } from 'next-intl'
import React from 'react'
import { VCard } from '../../address-books-types'
import EmailItem from './email-item'

interface VisualizationProps {
  data: VCard
}

const Visualization: React.FC<VisualizationProps> = ({ data }) => {
  const { firstName, lastName, organization, jobTitle, photo } = data
  const title =
    organization && jobTitle
      ? `${firstName} ${lastName} - ${organization} - ${jobTitle}`
      : `${firstName} ${lastName}`

  const t = useTranslations('Address_Book_Item')

  return (
    <Card className="h-full w-full">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar className="h-24 w-24">
            {photo ? (
              <AvatarImage
                src={photo}
                alt={`${firstName} ${lastName}`}
                className="object-cover"
              />
            ) : (
              <AvatarFallback className="text-4xl">
                {firstName[0].toUpperCase()}
                {lastName[0].toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h2 className="text-3xl font-bold text-gray-500">{title}</h2>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Separator className="my-4" />
        <h3 className="text-lg font-semibold">{t('label_emails.string')}</h3>
        <div className="grid grid-cols-3 gap-4">
          {data.emails.length &&
            data.emails.map((email, index) => (
              <EmailItem key={index} email={email} />
            ))}
        </div>
        <Separator className="my-4" />
        <h3 className="text-lg font-semibold">{t('label_addresses.string')}</h3>
        <div className="grid grid-cols-3 gap-4">
          {data.addresses.length &&
            data.emails.map((email, index) => (
              <EmailItem key={index} email={email} />
            ))}
        </div>
        <h3 className="text-lg font-semibold">
          {t('label_contact_information.string')}
        </h3>
        <p className="text-gray-500">{data.email}</p>
        <p className="text-gray-500">{data.phoneNumbers}</p>
        <p className="text-gray-500">{data.addresses}</p>
        <h3 className="text-lg font-semibold">{t('label_notes.string')}</h3>
        <p className="text-gray-500">{data.note}</p>
      </CardContent>
    </Card>
  )
}

export default Visualization
