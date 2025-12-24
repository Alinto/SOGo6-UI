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
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  useGetImapAccountDetailQuery,
  useUpdateImapAccountMutation,
} from '../store/imap-accounts-api'
import { imapAccountEditSchema } from './imap-schema'
import ImapSecurityTab from './imap-security-tab'
import ImapSettingsTab from './imap-settings-tab'

interface ImapEditFormProps {
  accountId: string
  onBack: () => void
}

function ImapEditForm({ accountId, onBack }: ImapEditFormProps) {
  const t = useTranslations('US_MAIL_IMAP_ACCOUNTS')
  const formT = useTranslations('FORM_COMMONS')

  const {
    data: account,
    isLoading,
    error,
  } = useGetImapAccountDetailQuery(accountId)
  const [updateAccount] = useUpdateImapAccountMutation()

  const form = useForm<z.infer<typeof imapAccountEditSchema>>({
    resolver: zodResolver(imapAccountEditSchema),
    defaultValues: {
      readReceipts: 'never',
    },
  })

  // Update form when data arrives
  useEffect(() => {
    if (account) {
      form.reset({
        readReceipts: account.readReceipts,
      })
    }
  }, [account, form])

  const { isDirty, isSubmitting } = form.formState

  async function onSubmit(values: z.infer<typeof imapAccountEditSchema>) {
    try {
      await updateAccount({
        id: accountId,
        readReceipts: values.readReceipts,
      }).unwrap()

      form.reset(values)
    } catch (error) {
      console.error('Failed to update:', error)
    }
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="border-destructive/50 bg-destructive/10 text-destructive rounded-lg border p-4 text-sm">
            {t('errors_api.load_failed.string')}
          </div>
          <Button variant="outline" onClick={onBack} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('edit.back_button.string')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (isLoading || !account) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
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
                <CardTitle>{t('edit.title.string')}</CardTitle>
                <CardDescription>{account.username}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg border p-4 text-sm">
              <p className="text-muted-foreground">
                {t('edit.readonly_notice.string')}
              </p>
            </div>

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
                <ImapSettingsTab
                  form={form}
                  mode="edit"
                  accountData={account}
                />
              </TabsContent>
              <TabsContent value="security">
                <ImapSecurityTab
                  form={form}
                  mode="edit"
                  accountData={account}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <FixedFormButtonGroup
          onReset={() =>
            account && form.reset({ readReceipts: account.readReceipts })
          }
          disableReset={!isDirty || isSubmitting}
          disableSubmit={!isDirty || isSubmitting}
          mode="floating"
          resetLabel={formT('reset.default.string')}
          submitLabel={formT('save.default.string')}
        />
      </form>
    </Form>
  )
}

export default ImapEditForm
