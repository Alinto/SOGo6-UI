'use client'

import React, { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Form } from '@/components/ui/form'
import FixedFormButtonGroup from '@/components/ui/forms/fixed-form-button-group'
import type { AdminFormProps } from '../../types/form'
import SectionRenderer from './admin-panel-section-renderer'
import {
  createDefaultValues,
  createDynamicSchema,
  createVisibilityResolver,
  filterInvisibleFields,
} from './utils'

type Props = AdminFormProps & {
  // New prop: which tab to render (UI only). `data` now contains all tabs.
  activeTab?: string
}

const AdminDomainFormFrame: React.FC<Props> = ({
  data,
  activeTab,
  onSubmit,
  isLoading = false,
}) => {
  // Build schema + defaultValues from the full data (all tabs)
  const { schema, defaultValues } = useMemo(() => {
    if (!data || Object.keys(data).length === 0) {
      return { schema: z.object({}), defaultValues: {} }
    }

    const schema = createDynamicSchema(data as Record<string, any>)
    const defaultValues = createDefaultValues(data as Record<string, any>)
    return { schema, defaultValues }
  }, [data])
  // create resolver that filters out invisible fields using metadata
  const resolver = useMemo(
    () => createVisibilityResolver(schema, data ?? {}),
    [schema, data]
  )

  const form = useForm<z.infer<typeof schema>>({
    resolver,
    defaultValues,
  })

  // When defaultValues change (e.g. remote data arrives), reset the form so fields are populated with the new defaults.
  useEffect(() => {
    // reset will replace the form values and clear dirty state
    form.reset(defaultValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(defaultValues)])
  // For rendering we only show the activeTab section(s) — keep the form state for all sections.
  const renderData = useMemo(() => {
    if (!activeTab) return data
    // keep shape: { SECTION_KEY: sectionMeta }
    return { [activeTab]: (data as any)[activeTab] ?? {} }
  }, [data, activeTab])

  async function handleSubmit(values: z.infer<typeof schema>) {
    // IMPORTANT: don't compute the server-diff here.
    // Instead send the full filtered values to the hook so it can:
    //  - convert duplicable arrays -> mapped objects in the same way the backend expects
    //  - compare against the original settings (which are in useDomainConfig)
    // This avoids shape mismatches that caused USER_SOURCE to be included.
    const filteredValues = filterInvisibleFields(values as any, data as any)

    // forward the full (filtered) values to the provided onSubmit handler
    await onSubmit(filteredValues)
  }

  // onInvalid callback: useful to surface validation problems
  function handleInvalid(errors: any) {
    console.error('[AdminDomainFormFrame] validation errors:', errors)
    alert('Validation errors: some fields are invalid.') //TODO: toast avec trad
  }

  const { isDirty, isSubmitting } = form.formState

  return (
    <div className="border-border flex min-h-screen w-full flex-1 flex-col rounded border p-4 shadow-sm">
      <Form {...form}>
        <form
          className=""
          onSubmit={form.handleSubmit(handleSubmit, handleInvalid)}
        >
          {renderData &&
            Object.entries(renderData).map(([sectionKey, sectionMeta]) => (
              <div key={sectionKey} className="mb-8">
                <SectionRenderer
                  sectionKey={sectionKey}
                  sectionMeta={sectionMeta as any}
                  form={form}
                />
              </div>
            ))}

          <FixedFormButtonGroup
            onReset={() => form.reset(defaultValues)}
            disableReset={!isDirty || isSubmitting || isLoading}
            disableSubmit={!isDirty || isSubmitting || isLoading}
          />
        </form>
      </Form>
    </div>
  )
}

export default AdminDomainFormFrame
