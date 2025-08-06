'use client'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import QRCode from '@/components/ui/qrcode'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { defaultValues, schema } from './totp-schema'

const TotpForm: React.FC = () => {
  const formT = useTranslations('FORM_COMMONS')
  const t = useTranslations('US_SECURITY')

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  function onSubmit(values: z.infer<typeof schema>) {
    console.log(values)
  }
  const { totp } = form.getValues()
  return (
    <Form {...form}>
      <form
        className="rounded-md border p-4 shadow-sm"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div>
          <FormField
            control={form.control}
            name="totp"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-y-0 space-x-3 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{t('totp.title.string')}</FormLabel>
                  <FormDescription>
                    {t('totp.description.string')}
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>
        {totp ? (
          <div className="flex">
            <QRCode text="https://github.com/Alinto/" />
            <div className="m-auto ml-3">
              <div>
                <Label>{t('totp.verification_code.title.string')}</Label>
                <Input />
                <FormDescription>
                  {t('totp.verification_code.description.string')}
                </FormDescription>
              </div>
            </div>
          </div>
        ) : null}
        <div className="flex justify-end">
          <Button className="text-background">
            {formT('save.default.string')}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default TotpForm
