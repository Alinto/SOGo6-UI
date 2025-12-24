'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import FixedFormButtonGroup from '@/components/ui/forms/fixed-form-button-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useCreateImapAccountMutation } from '../store/imap-accounts-api'
import { DEFAULT_IMAP_VALUES } from '../types'
import { imapAccountCreateSchema } from './imap-schema'
import ImapSecurityTab from './imap-security-tab'
import ImapSettingsTab from './imap-settings-tab'

interface ImapNewFormProps {
  onBack: () => void
  onSuccess: () => void
}

function ImapNewForm({ onBack, onSuccess }: ImapNewFormProps) {
  const t = useTranslations('US_MAIL_IMAP_ACCOUNTS')
  const formT = useTranslations('FORM_COMMONS')

  const [createAccount] = useCreateImapAccountMutation()

  const form = useForm<z.infer<typeof imapAccountCreateSchema>>({
    resolver: zodResolver(imapAccountCreateSchema),
    defaultValues: {
      ...DEFAULT_IMAP_VALUES,
      password: '',
    },
  })

  const { isDirty, isSubmitting } = form.formState

  async function onSubmit(values: z.infer<typeof imapAccountCreateSchema>) {
    try {
      await createAccount(values).unwrap()
      form.reset()
      onSuccess()
    } catch (error) {
      console.error('Failed to create:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onBack}
                aria-label={t('new.back_button.string')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle>{t('new.title.string')}</CardTitle>
                <CardDescription>{t('new.description.string')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="settings" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="settings">
                  {t('tabs.settings.string')}
                </TabsTrigger>
                <TabsTrigger value="security">
                  {t('tabs.security.string')}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="settings">
                <ImapSettingsTab form={form} mode="new" />
              </TabsContent>
              <TabsContent value="security">
                <ImapSecurityTab form={form} mode="new" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <FixedFormButtonGroup
          onReset={() => form.reset()}
          disableReset={!isDirty || isSubmitting}
          disableSubmit={isSubmitting}
          mode="floating"
          resetLabel={formT('reset.default.string')}
          submitLabel={t('new.create_button.string')}
        />
      </form>
    </Form>
  )
}

export default ImapNewForm
