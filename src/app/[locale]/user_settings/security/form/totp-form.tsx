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
  const t = useTranslations('Account_Security')
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
        className="border rounded-md shadow p-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div>
          <FormField
            control={form.control}
            name="totp"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{t('totp.title')}</FormLabel>
                  <FormDescription>{t('totp.description')}</FormDescription>
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
                <Label>{t('totp.verification_code.title')}</Label>
                <Input />
                <FormDescription>
                  {t('totp.verification_code.description')}
                </FormDescription>
              </div>
            </div>
          </div>
        ) : null}
        <div className="flex justify-end">
          <Button className="text-background">{t('totp.save')}</Button>
        </div>
      </form>
    </Form>
  )
}

export default TotpForm
