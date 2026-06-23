import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import React from 'react'
import { VCard } from '../../address-books-types'
import ContactActions from './contact-actions'
import { ContactFieldRow } from './contact-field-row'
import { ContactHeader } from './contact-header'
import { EmailItem } from './email-item'
import { NoteField } from './note-field'

interface ContactVisualizationProps {
  data: VCard
}

const ContactVisualization: React.FC<ContactVisualizationProps> = ({ data }) => {
  const {
    firstName,
    lastName,
    organization,
    jobTitle,
    photo,
    emails,
    phoneNumbers,
    addresses,
    note,
    urls,
  } = data

  const { book_id, contact_id } = useParams()
  const t = useTranslations('CONTACT_FORM')

  return (
    <Card className="flex h-full w-full flex-col">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <ContactHeader
            firstName={firstName}
            lastName={lastName}
            organization={organization}
            jobTitle={jobTitle}
            photo={photo}
          />
          {book_id && contact_id && (
            <ContactActions
              contactId={contact_id as string}
              bookId={book_id as string}
              emails={emails}
              displayName={[firstName, lastName].filter(Boolean).join(' ')}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-6 overflow-y-auto">
        {emails && emails.length > 0 && (
          <section aria-labelledby="emails-heading" className="space-y-3">
            <h2
              id="emails-heading"
              className="text-foreground text-base font-semibold sm:text-lg"
            >
              {t('emails.string')}
            </h2>
            <div className="space-y-1">
              {emails.map((email, index) => (
                <EmailItem
                  key={index}
                  email={email}
                  displayName={[firstName, lastName].filter(Boolean).join(' ')}
                />
              ))}
            </div>
          </section>
        )}

        {phoneNumbers && phoneNumbers.length > 0 && (
          <section aria-labelledby="phone-heading" className="space-y-3">
            <Separator />
            <h2
              id="phone-heading"
              className="text-foreground text-base font-semibold sm:text-lg"
            >
              {t('phone_numbers.string')}
            </h2>
            <div className="space-y-1">
              {phoneNumbers.map((phone, index) => (
                <ContactFieldRow key={index} value={phone} type="phone" />
              ))}
            </div>
          </section>
        )}

        {addresses && addresses.length > 0 && (
          <section aria-labelledby="addresses-heading" className="space-y-3">
            <Separator />
            <h2
              id="addresses-heading"
              className="text-foreground text-base font-semibold sm:text-lg"
            >
              {t('addresses.string')}
            </h2>
            <div className="space-y-1">
              {addresses.map((address, index) => (
                <ContactFieldRow key={index} value={address} type="text" />
              ))}
            </div>
          </section>
        )}

        {urls && urls.length > 0 && (
          <section aria-labelledby="urls-heading" className="space-y-3">
            <Separator />
            <h2
              id="urls-heading"
              className="text-foreground text-base font-semibold sm:text-lg"
            >
              {t('urls.string')}
            </h2>
            <div className="space-y-1">
              {urls.map((url, index) => (
                <ContactFieldRow key={index} value={url} type="url" />
              ))}
            </div>
          </section>
        )}

        {data.birthday && (
          <section aria-labelledby="birthday-heading" className="space-y-3">
            <Separator />
            <h2
              id="birthday-heading"
              className="text-foreground text-base font-semibold sm:text-lg"
            >
              {t('birthday.string')}
            </h2>
            <ContactFieldRow value={data.birthday} type="text" />
          </section>
        )}

        <section aria-labelledby="notes-heading" className="space-y-3">
          <Separator />
          <h2
            id="notes-heading"
            className="text-foreground text-base font-semibold sm:text-lg"
          >
            {t('notes.string')}
          </h2>
          <NoteField
            note={note}
            contactId={contact_id as string}
            bookId={book_id as string}
          />
        </section>
      </CardContent>
    </Card>
  )
}

export default ContactVisualization
