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
import { MailboxSettings } from '@/features/user-settings/mail/external-accounts/store/mailboxes-form-types'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { MODE_CREATE, MODE_EDIT } from '../external-accounts-utils'
import {
  AUTHMECH_LOGIN,
  AUTHMECH_PLAIN,
  Mailbox,
  MailboxPOST,
  SOCKET_ENC_EXPLICIT_TLS,
} from '../store/mailboxes-api-types'
import { schema, schemaType } from './external-accounts-schema'
import ImapSecurityTab from './external-accounts-security-tab'
import ExternalAccountSettingsTab from './external-accounts-settings-tab'

import {
  mapMailboxSettingsToApi,
  mapMailboxSettingsToApiCreate,
} from '@/features/user-settings/mail/external-accounts/store/mailboxes-utils'

interface ExternalAccountFormProps {
  data?: MailboxSettings
  onBack: () => void
  manageData: (data: Mailbox | MailboxPOST) => void
  error: string | null
  mode: typeof MODE_EDIT | typeof MODE_CREATE
  onSuccess?: () => void
}

function ExternalAccountForm({
  data,
  manageData,
  onBack,
  error,
  mode,
  onSuccess,
}: ExternalAccountFormProps) {
  const t = useTranslations('US_MAIL_EXTERNAL_ACCOUNTS')
  const t_commons = useTranslations('FORM_COMMONS')

  const mailboxSchema = schema(t, t_commons)

  const form = useForm<schemaType>({
    resolver: zodResolver(mailboxSchema) as any,
    mode: 'onBlur',
    defaultValues: data || {
      name: '',
      mail_server: {
        server: '',
        port: 993,
        encryption: SOCKET_ENC_EXPLICIT_TLS,
        auth_mech: AUTHMECH_PLAIN,
        username: '',
        password: '',
      },
      mail_outgoing: {
        server: '',
        port: 587,
        encryption: SOCKET_ENC_EXPLICIT_TLS,
        auth_mech: AUTHMECH_LOGIN,
        username: '',
        password: '',
      },
      identities: [
        { name: '', mail: '', replyTo: '', isDefault: true, signatures: {} },
      ],
    },
  })

  useEffect(() => {
    if (data) {
      form.reset(data, {
        keepValues: false,
        keepDirty: false,
        keepDefaultValues: false,
      })
    }
  }, [data, form])

  const { isDirty, isSubmitting } = form.formState

  async function onSubmit(values: schemaType) {
    try {
      const valuesWithId = values as MailboxSettings
      if (mode === MODE_EDIT && valuesWithId.id) {
        manageData(mapMailboxSettingsToApi(valuesWithId))
      }
      if (mode === MODE_CREATE) {
        manageData(mapMailboxSettingsToApiCreate(valuesWithId))
      }
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Failed to manageData:', error)
    }
  }

  if (error) {
    console.log('Error in ExternalAccountForm:', error)
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="border-destructive/50 bg-destructive/10 text-destructive rounded-lg border p-4 text-sm">
            {t('notifications.errors_api.load_failed.string')}
            {error}
          </div>
          <Button variant="outline" onClick={onBack} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('edit.back_button.string')}
          </Button>
        </CardContent>
      </Card>
    )
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
                aria-label={t('edit.back_button.string')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                {mode === MODE_EDIT && (
                  <div>
                    <CardTitle>{t('edit.title.string')}</CardTitle>
                    <CardDescription>{data?.name}</CardDescription>{' '}
                  </div>
                )}
                {mode === MODE_CREATE && (
                  <div>
                    <CardTitle>{t('new.title.string')}</CardTitle>
                  </div>
                )}
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
                <ExternalAccountSettingsTab
                  form={form}
                  mode={mode}
                  mailboxData={data}
                />
              </TabsContent>
              <TabsContent value="security">
                <ImapSecurityTab form={form} mode={mode} mailboxData={data} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <FixedFormButtonGroup
          onReset={() => data && form.reset()}
          disableReset={!isDirty || isSubmitting}
          disableSubmit={!isDirty || isSubmitting}
          errors={form.formState.errors}
          // resetLabel={formT('reset.default.string')}
          // submitLabel={formT('save.default.string')}
        />
      </form>
    </Form>
  )
}

export default ExternalAccountForm
