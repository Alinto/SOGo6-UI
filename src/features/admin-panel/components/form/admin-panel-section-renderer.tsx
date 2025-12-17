import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import React from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { SectionMeta } from '../../types/admin-config'
import CollapsibleArrayItem from './admin-panel-collabsible-array-item'
import FieldRenderer from './admin-panel-field-renderer'
import { getEmptyValueForType } from './utils'

const SectionRenderer: React.FC<{
  sectionKey: string
  sectionMeta: SectionMeta
  form: UseFormReturn<any>
}> = ({ sectionKey, sectionMeta, form }) => {
  const { options, is_duplicable } = sectionMeta

  // Non-duplicable section: render only root fields (those without a 'depends')
  // Les champs qui ont un depends seront rendus comme enfants (indentés) par leur parent dans FieldRenderer
  if (!is_duplicable) {
    return (
      <div className="space-y-4">
        {options
          .filter((opt) => !opt.depends)
          .map((opt) => (
            <FieldRenderer
              key={opt.name}
              fieldOption={opt}
              fullFieldName={`${sectionKey}.${opt.name}`}
              form={form}
              sectionKey={sectionKey}
              sectionOptions={options}
              isSectionDuplicable={is_duplicable}
            />
          ))}
      </div>
    )
  }

  // Duplicable section: expect an array of items in form under sectionKey
  const currentItems = form.watch(sectionKey) ?? []

  return (
    <div className="space-y-4">
      <div>
        {(currentItems as any[]).map((item, idx) =>
          // keep placeholder slots (null) in the underlying array so indices match original_keys,
          // but don't render UI for deleted (null) entries
          item == null ? null : (
            <CollapsibleArrayItem
              key={idx}
              index={idx}
              configOptions={options}
              sectionKey={sectionKey}
              form={form}
              isSectionDuplicable={is_duplicable}
            />
          )
        )}
      </div>

      {/* Add button: create an item using defaults from options */}
      <div className="mt-4 flex justify-center">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={() => {
            const defaults: Record<string, any> = {}
            options.forEach((o) => {
              defaults[o.name] =
                o.default !== undefined
                  ? JSON.parse(JSON.stringify(o.default))
                  : getEmptyValueForType(o.data_type)
            })

            const arr = Array.isArray(currentItems) ? [...currentItems] : []

            // Reuse first null/undefined slot if present to preserve original indexing
            const reuseIndex = arr.findIndex(
              (x) => x === null || x === undefined
            )
            if (reuseIndex !== -1) {
              arr[reuseIndex] = defaults
            } else {
              arr.push(defaults)
            }

            // Mark form dirty so submit button is enabled
            form.setValue(sectionKey, arr, {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: false,
            })
          }}
          aria-label={`Add new ${sectionKey}`}
          className="inline-flex h-10 w-10 transform justify-center rounded-full border p-2 shadow-sm transition duration-150 hover:scale-110"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

export default SectionRenderer
