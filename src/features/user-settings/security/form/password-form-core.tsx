'use client'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { PasswordInput } from '@/components/ui/inputs/input-password'
import { Separator } from '@/components/ui/separator'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { defaultValues, schema } from './password-schema'

const PasswordForm: React.FC = () => {
  const formT = useTranslations('FORM_COMMONS')
  const t = useTranslations('FORM_PASSWORD')
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  function onSubmit(values: z.infer<typeof schema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form
        className="rounded-md border p-4 shadow-sm"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <h3 className="text-lg">{t('title.string')}</h3>
        <p className="text-muted-foreground text-sm">
          {t('description.string')}
        </p>
        <Separator className="my-4" />
        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('current.string')}</FormLabel>
                <FormControl>
                  <PasswordInput {...field} placeholder={t('current.string')} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('new.string')}</FormLabel>
                <FormControl>
                  <PasswordInput {...field} placeholder={t('new.string')} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('confirm.string')}</FormLabel>
                <FormControl>
                  <PasswordInput {...field} placeholder={t('confirm.string')} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end pt-6">
          <Button className="text-background">
            {formT('save.default.string')}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default PasswordForm
