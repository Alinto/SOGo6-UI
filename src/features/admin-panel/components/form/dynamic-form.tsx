'use client'
//NON UTILISÉE, remplacée par AdminDomainFormFrame
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import FixedFormButtonGroup from '@/components/ui/forms/fixed-form-button-group'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { AdminConfig } from '../../types/admin-config'
import {
  createDefaultValues,
  createDynamicSchema,
  renderDynamicComponent,
} from './utils'

interface Props {
  data: AdminConfig[] | undefined
  onSubmit: (_values: Record<string, unknown>) => void
  isLoading?: boolean
}

const REQUIRED_INDICATOR = '*'

const DynamicForm: React.FC<Props> = ({
  data,
  onSubmit,
  isLoading = false,
}) => {
  const { schema, defaultValues } = useMemo(() => {
    if (!data || data.length === 0) {
      return { schema: z.object({}), defaultValues: {} }
    }
    return {
      schema: createDynamicSchema(data),
      defaultValues: createDefaultValues(data),
    }
  }, [data])
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  function handleSubmit(values: z.infer<typeof schema>) {
    onSubmit(values)
  }
  const { isDirty, isSubmitting } = form.formState

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Configuration</CardTitle>
        <CardDescription>Paramètres avancés du domaine</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="space-y-6"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {data.map((item) => (
                <FormField
                  key={item.name}
                  control={form.control}
                  name={item.name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        {item.name}
                        {item.required && (
                          <span className="text-destructive ml-1">
                            {REQUIRED_INDICATOR}
                          </span>
                        )}
                      </FormLabel>
                      <FormControl>
                        {renderDynamicComponent(item, field)}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <FixedFormButtonGroup
              onReset={() => form.reset(defaultValues)}
              disableReset={!isDirty || isSubmitting || isLoading}
              disableSubmit={!isDirty || isSubmitting || isLoading}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default DynamicForm
