'use client'

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import {
  isDependencyMet,
  parseDependency,
} from '@/features/admin-panel/utils/dependency-checker'
import { useTranslations } from 'next-intl'
import React from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { ConfigOption } from '../../types/admin-config'
import { renderDynamicComponent } from './utils'

const FieldRenderer: React.FC<{
  fieldOption: ConfigOption
  fullFieldName: string
  form: UseFormReturn<any>
  sectionKey: string
  sectionOptions?: ConfigOption[]
  isSectionDuplicable?: boolean
}> = ({
  fieldOption,
  fullFieldName,
  form,
  sectionOptions,
  isSectionDuplicable,
}) => {
  const t = useTranslations('AP_DOMAIN_CONFIGURATION')

  // Parse dependency if present and decide visibility for THIS field
  const dependency = parseDependency(fieldOption.depends ?? null)
  let isVisible = true

  if (dependency) {
    // Determine dependent field path in the form
    let dependentPath = ''

    if (dependency.fieldName.includes('.')) {
      // explicit dotted path in dependency => trust it
      dependentPath = dependency.fieldName
    } else {
      // If section is explicitly marked duplicable, we should preserve the same index
      // for sibling dependencies (SECTION.<index>.FIELD)
      const parts = fullFieldName.split('.')
      if (isSectionDuplicable) {
        // expected shape: SECTION.<index>.FIELD
        dependentPath = `${parts[0]}.${parts[1]}.${dependency.fieldName}`
      } else {
        // non-duplicable section or fallback: SECTION.FIELD
        dependentPath = `${parts[0]}.${dependency.fieldName}`
      }
    }

    // watch the dependent field so this component re-renders when it changes
    const parentValue = form.watch(dependentPath)
    isVisible = isDependencyMet(dependency, parentValue)
  }

  // If not visible (dependency not met), don't render the field at all
  if (!isVisible) return null

  return (
    <FormField
      control={form.control}
      name={fullFieldName}
      render={({ field }) => {
        // value of this field (used to determine which children to show)
        const myValue = form.watch(fullFieldName)
        // find direct children of this field in the section options
        const childrenOptions = (sectionOptions ?? []).filter((opt) => {
          if (!opt.depends) return false
          const dep = parseDependency(opt.depends)
          if (!dep) return false
          // match dependency field name to this field's name or dotted references
          return (
            dep.fieldName === fieldOption.name ||
            dep.fieldName.endsWith(`.${fieldOption.name}`) ||
            dep.fieldName === fullFieldName
          )
        })

        // compute only visible children
        const visibleChildren = childrenOptions.filter((child) => {
          const dep = parseDependency(child.depends ?? null)
          if (!dep) return true
          return isDependencyMet(dep, myValue)
        })

        return (
          <>
            <FormItem className="grid grid-cols-6 gap-4 py-2">
              <div className="col-span-3 font-medium">
                <FormLabel className="text-sm font-medium">
                  <span className="text-md font-semibold">
                    {t(`properties.${fieldOption.name}.name.string`, {
                      default: fieldOption.name,
                    })}
                  </span>
                </FormLabel>
                <FormDescription>
                  {t(`properties.${fieldOption.name}.description.string`, {
                    default: '',
                  })}
                </FormDescription>
              </div>
              <div className="col-span-2 my-auto">
                <FormControl>
                  {renderDynamicComponent(fieldOption as any, field)}
                </FormControl>
              </div>
            </FormItem>

            {visibleChildren.length > 0 && (
              // indentation container with vertical line on the left
              <div className="border-muted col-span-6 ml-6 border-l pl-4">
                <div className="space-y-2 py-2">
                  {visibleChildren.map((child) => {
                    // compute child's full field name preserving index if section is duplicable
                    const parts = fullFieldName.split('.')
                    let basePrefix = parts[0] // SECTION
                    if (isSectionDuplicable && parts.length >= 3) {
                      // SECTION.<index>.FIELD => keep SECTION.<index> as prefix
                      basePrefix = `${parts[0]}.${parts[1]}`
                    }
                    const childFullFieldName = `${basePrefix}.${child.name}`

                    return (
                      <FieldRenderer
                        key={child.name}
                        fieldOption={child}
                        fullFieldName={childFullFieldName}
                        form={form}
                        sectionKey={''}
                        sectionOptions={sectionOptions}
                        isSectionDuplicable={isSectionDuplicable}
                      />
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )
      }}
    />
  )
}

export default FieldRenderer
