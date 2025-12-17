'use client'

import Dict from '@/components/ui/dict'
import { Input } from '@/components/ui/input'
import { MultiSelect } from '@/components/ui/multi-select'
import MultiSelectInput from '@/components/ui/multi-select-input'
import { BasicSelect } from '@/components/ui/select/basic-select'
import { Switch } from '@/components/ui/switch'
import {
  getVisibleChildren,
  isDependencyMet,
  parseDependency,
} from '@/features/admin-panel/utils/dependency-checker'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import type { ControllerRenderProps } from 'react-hook-form'
import { z } from 'zod'

/* -----------------------
   Small helpers
   ----------------------- */

const makeCommonProps = (field: ControllerRenderProps) => ({
  value:
    field.value === undefined || field.value === null
      ? ''
      : (field.value as any),
  onChange: field.onChange,
  onBlur: field.onBlur,
  name: field.name,
  disabled: field.disabled || false,
})

const choicesToOptions = (choices: any[] = []) =>
  choices.map((c: any) => ({ value: String(c), label: String(c) }))

const parseJsonSafely = (s: string) => {
  try {
    return JSON.parse(s)
  } catch {
    return undefined
  }
}

function cloneSafe<T>(v: T) {
  try {
    return JSON.parse(JSON.stringify(v))
  } catch {
    return v
  }
}

/* -----------------------
   Renderers
   ----------------------- */

export const renderDynamicComponent = (
  item: any,
  field: ControllerRenderProps
) => {
  const commonProps = makeCommonProps(field)

  if (item.data_type === 'str' && item.constraints?.choices) {
    return (
      <BasicSelect
        {...commonProps}
        options={choicesToOptions(item.constraints.choices)}
        placeholder={`Select ${item.name.toLowerCase()}`}
      />
    )
  }

  if (item.data_type === 'list[str]' && item.constraints?.choices) {
    const options = (item.constraints.choices ?? []).map((choice: string) => ({
      value: choice,
      label: choice,
    }))
    return (
      <MultiSelect
        defaultValue={Array.isArray(field.value) ? field.value : []}
        onValueChange={(vals: string[]) => field.onChange(vals)}
        options={options}
        placeholder={`Select ${item.name.toLowerCase()}`}
        multiple={true}
        disabled={field.disabled}
      />
    )
  }

  if (item.data_type === 'list[number]' && item.constraints?.choices) {
    const options = (item.constraints.choices ?? []).map((choice: number) => ({
      value: String(choice),
      label: String(choice),
    }))
    return (
      <MultiSelect
        defaultValue={
          Array.isArray(field.value) ? (field.value as any).map(String) : []
        }
        onValueChange={(vals: string[]) => {
          const mapped = Array.isArray(vals) ? vals.map((v) => Number(v)) : []
          field.onChange(mapped)
        }}
        options={options}
        placeholder={`Select ${item.name.toLowerCase()}`}
        multiple={true}
        disabled={field.disabled}
      />
    )
  }

  if (item.data_type === 'bool') {
    return (
      <Switch
        checked={Boolean(field.value)}
        onCheckedChange={field.onChange}
        disabled={field.disabled}
        name={field.name}
      />
    )
  }

  if (item.data_type === 'secret') {
    return (
      <Input
        value={field.value ?? ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          field.onChange(e.target.value)
        }
        placeholder="Enter value"
        type="password"
      />
    )
  }

  if (item.data_type === 'email') {
    return (
      <Input
        value={field.value ?? ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          field.onChange(e.target.value)
        }
        placeholder="Enter email"
        type="email"
      />
    )
  }

  if (item.data_type === 'url') {
    return (
      <Input
        value={field.value ?? ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          field.onChange(e.target.value)
        }
        placeholder="Enter URL"
        type="url"
      />
    )
  }

  if (item.data_type === 'dict') {
    return (
      <Dict
        value={field.value}
        onChange={(v) => field.onChange(v)}
        disabled={field.disabled}
        name={field.name}
        itemName={item.name}
      />
    )
  }

  if (item.data_type?.startsWith('list')) {
    if (item.data_type === 'list[str]') {
      return (
        <MultiSelectInput
          value={Array.isArray(field.value) ? field.value : []}
          onChange={(v) => field.onChange(v)}
          placeholder={`Add ${item.name.toLowerCase()}`}
          disabled={field.disabled}
          name={field.name}
        />
      )
    }

    return Array.isArray(field.value) ? (
      <Input
        value={JSON.stringify(field.value || [])}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const parsed = parseJsonSafely(e.target.value)
          if (parsed !== undefined) field.onChange(parsed)
        }}
        placeholder="Enter value"
        type="text"
      />
    ) : (
      <Input
        value={field.value ?? ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const parsed = parseJsonSafely(e.target.value)
          if (parsed !== undefined) field.onChange(parsed)
        }}
        placeholder="Enter value"
        type="text"
      />
    )
  }

  if (item.data_type === 'number') {
    return (
      <Input
        value={field.value ?? ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          e.target.value === ''
            ? field.onChange(undefined)
            : field.onChange(Number(e.target.value))
        }
        placeholder="Enter number"
        type="number"
      />
    )
  }

  return <Input {...commonProps} placeholder="Enter value" type="text" />
}

/* -----------------------
   Schema builder
   ----------------------- */

const emptyToUndef = (val: unknown) =>
  val === '' || val === null || val === undefined ? undefined : val

const coerceStringNumberToNumber = (val: unknown) => {
  if (val === '' || val === null || val === undefined) return undefined
  if (typeof val === 'string') {
    const n = Number(val)
    return Number.isNaN(n) ? val : n
  }
  return val
}

export const createDynamicSchema = (data: Record<string, any>) => {
  const schemaObject: Record<string, z.ZodTypeAny> = {}

  Object.entries(data).forEach(([sectionKey, meta]) => {
    const options = (meta as any).options ?? []
    const isDuplicable = Boolean((meta as any).is_duplicable)

    const nestedSchema: Record<string, z.ZodTypeAny> = {}
    options.forEach((opt: any) => {
      const dt = opt.data_type
      const constraints = opt.constraints ?? {}
      let fieldSchema: z.ZodTypeAny

      switch (dt) {
        case 'bool':
          fieldSchema = z.boolean()
          break

        case 'number': {
          let inner = z.number()
          if (typeof constraints.min_inclusive === 'number')
            inner = inner.min(constraints.min_inclusive)
          if (typeof constraints.max_inclusive === 'number')
            inner = inner.max(constraints.max_inclusive)
          fieldSchema = z.preprocess(coerceStringNumberToNumber, inner)
          break
        }

        case 'email':
          fieldSchema = z.preprocess(emptyToUndef, z.string().email())
          break

        case 'url':
          fieldSchema = z.preprocess(emptyToUndef, z.string().url())
          break

        case 'list[str]': {
          let arr = z.array(z.string())
          if (typeof constraints.len_min === 'number')
            arr = arr.min(constraints.len_min)
          if (typeof constraints.len_max === 'number')
            arr = arr.max(constraints.len_max)
          fieldSchema = arr
          break
        }

        case 'list[number]': {
          const elem = z.preprocess((v) => {
            if (v === '' || v === null || v === undefined) return undefined
            if (typeof v === 'string') {
              const n = Number(v)
              return Number.isNaN(n) ? v : n
            }
            return v
          }, z.number())
          fieldSchema = z.array(elem)
          break
        }

        case 'dict':
          fieldSchema = z.record(z.unknown())
          break

        default:
          fieldSchema = z.preprocess(emptyToUndef, z.string())
          break
      }

      if (!opt.required || opt.depends) {
        fieldSchema = fieldSchema.optional()
      }

      nestedSchema[opt.name] = fieldSchema
    })

    const sectionSchema = z.object(nestedSchema)
    schemaObject[sectionKey] = isDuplicable
      ? z.array(sectionSchema.nullable())
      : sectionSchema
  })

  return z.object(schemaObject)
}

/* -----------------------
   Default values builder
   ----------------------- */

export const createDefaultValues = (
  data: Record<string, any>
): Record<string, any> => {
  const defaultValues: Record<string, any> = {}

  Object.entries(data).forEach(([sectionKey, meta]) => {
    const options = (meta as any).options ?? []
    const isDuplicable = Boolean((meta as any).is_duplicable)

    if (isDuplicable) {
      if (Array.isArray((meta as any).initial_values)) {
        defaultValues[sectionKey] = cloneSafe((meta as any).initial_values)
      } else if ((meta as any).current_values) {
        const cvs = (meta as any).current_values
        if (Array.isArray(cvs)) defaultValues[sectionKey] = cloneSafe(cvs)
        else if (typeof cvs === 'object' && cvs !== null)
          defaultValues[sectionKey] = cloneSafe(Object.values(cvs))
        else defaultValues[sectionKey] = []
      } else {
        defaultValues[sectionKey] = []
      }

      if (
        sectionKey === 'USER_SOURCE' &&
        (!defaultValues[sectionKey] || defaultValues[sectionKey].length === 0)
      ) {
        const defaults: Record<string, any> = {}
        options.forEach((o: any) => {
          defaults[o.name] =
            o.default !== undefined
              ? cloneSafe(o.default)
              : getEmptyValueForType(o.data_type)
        })
        defaultValues[sectionKey] = [defaults]
      }
    } else {
      const obj: Record<string, any> = {}
      options.forEach((opt: any) => {
        if (
          (meta as any).current_values &&
          Object.prototype.hasOwnProperty.call(
            (meta as any).current_values,
            opt.name
          ) &&
          (meta as any).current_values[opt.name] !== undefined
        ) {
          obj[opt.name] = cloneSafe((meta as any).current_values[opt.name])
          return
        }

        if (opt.default !== undefined && opt.default !== null) {
          obj[opt.name] = cloneSafe(opt.default)
          return
        }

        if (opt.data_type?.startsWith('list'))
          obj[opt.name] = opt.required ? [] : undefined
        else if (opt.data_type === 'bool') obj[opt.name] = false
        else if (opt.data_type === 'number')
          obj[opt.name] = opt.required ? 0 : undefined
        else if (opt.data_type === 'dict') obj[opt.name] = {}
        else obj[opt.name] = ''
      })
      defaultValues[sectionKey] = obj
    }
  })

  return defaultValues
}

/* -----------------------
   Path utils, filtering, resolver
   ----------------------- */

export function getByPath(obj: any, path: string) {
  if (!obj) return undefined
  const parts = path.split('.')
  let cur: any = obj
  for (const p of parts) {
    if (cur == null) return undefined
    const idx = Number(p)
    cur = Number.isNaN(idx) ? cur[p] : cur[idx]
  }
  return cur
}

export function deleteByPath(obj: any, path: string) {
  if (!obj) return
  const parts = path.split('.')
  const last = parts.pop()
  if (!last) return
  let cur: any = obj
  for (const p of parts) {
    if (cur == null) return
    const idx = Number(p)
    cur = Number.isNaN(idx) ? cur[p] : cur[idx]
  }
  if (cur == null) return
  const idxLast = Number(last)
  if (!Number.isNaN(idxLast) && Array.isArray(cur)) {
    cur[idxLast] = undefined
  } else {
    delete cur[last]
  }
}

function isEmptyForValidation(val: any) {
  if (val === undefined || val === null) return true
  if (typeof val === 'string' && val === '') return true
  if (Array.isArray(val) && val.length === 0) return true
  return false
}

function pruneEmptyOptionalFields(
  values: Record<string, any>,
  meta: Record<string, any>
) {
  if (!values || !meta) return values
  const copy = values

  Object.entries(meta ?? {}).forEach(
    ([sectionKey, sectionMeta]: [string, any]) => {
      const options = (sectionMeta as any).options ?? []
      const isDuplicable = Boolean((sectionMeta as any).is_duplicable)

      if (isDuplicable) {
        const arr = getByPath(copy, sectionKey) ?? []
        if (!Array.isArray(arr)) return
        for (let i = 0; i < arr.length; i++) {
          const item = arr[i]
          if (!item || typeof item !== 'object') continue
          options.forEach((opt: any) => {
            if (!Object.prototype.hasOwnProperty.call(item, opt.name)) return
            const val = item[opt.name]
            if (isEmptyForValidation(val) && !opt.required) {
              delete item[opt.name]
            }
          })
        }
      } else {
        const sectionObj = getByPath(copy, sectionKey)
        if (!sectionObj || typeof sectionObj !== 'object') return
        options.forEach((opt: any) => {
          if (!Object.prototype.hasOwnProperty.call(sectionObj, opt.name))
            return
          const val = sectionObj[opt.name]
          if (isEmptyForValidation(val) && !opt.required) {
            delete sectionObj[opt.name]
          }
        })
      }
    }
  )

  return copy
}

export function filterInvisibleFields(
  values: Record<string, any>,
  meta: Record<string, any>
) {
  const orig = values ?? {}
  const copy = JSON.parse(JSON.stringify(orig))
  const reference = orig

  Object.entries(meta ?? {}).forEach(
    ([sectionKey, sectionMeta]: [string, any]) => {
      const options = (sectionMeta as any).options ?? []
      const isDuplicable = Boolean((sectionMeta as any).is_duplicable)

      if (isDuplicable) {
        const arr = getByPath(copy, sectionKey) ?? []
        const refArr = getByPath(reference, sectionKey) ?? []
        const len = Array.isArray(refArr) ? refArr.length : arr.length
        for (let i = 0; i < len; i++) {
          if (!getByPath(copy, `${sectionKey}.${i}`)) continue
          options.forEach((opt: any) => {
            if (!opt.depends) return
            const dep = parseDependency(opt.depends ?? null)
            if (!dep) return
            const dependentPath = dep.fieldName.includes('.')
              ? dep.fieldName
              : `${sectionKey}.${i}.${dep.fieldName}`
            const parentValue = getByPath(reference, dependentPath)
            const visible = isDependencyMet(dep, parentValue)
            if (!visible) deleteByPath(copy, `${sectionKey}.${i}.${opt.name}`)
          })
        }
      } else {
        const sectionObj = getByPath(copy, sectionKey)
        if (!sectionObj) return
        options.forEach((opt: any) => {
          if (!opt.depends) return
          const dep = parseDependency(opt.depends ?? null)
          if (!dep) return
          const dependentPath = dep.fieldName.includes('.')
            ? dep.fieldName
            : `${sectionKey}.${dep.fieldName}`
          const parentValue = getByPath(reference, dependentPath)
          const visible = isDependencyMet(dep, parentValue)
          if (!visible) deleteByPath(copy, `${sectionKey}.${opt.name}`)
        })
      }
    }
  )

  return copy
}

export function createVisibilityResolver(
  schema: z.ZodTypeAny,
  meta: Record<string, any>
) {
  const base = zodResolver(schema)
  return async (values: any, context: any, options: any) => {
    try {
      const filtered = filterInvisibleFields(values, meta)
      const cloned = JSON.parse(JSON.stringify(filtered))
      const pruned = pruneEmptyOptionalFields(cloned, meta)
      return await (base as any)(pruned, context, options)
    } catch (e) {
      return await (base as any)(values, context, options)
    }
  }
}

/* -----------------------
   Misc helpers used by form components
   ----------------------- */

export function buildDescription(domain: string, tab: string) {
  const tabLabel = tab
    .replace(/[_-]/g, ' ')
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase())
  return `${domain} ${tabLabel} parameters`
}

export function getVisibleChildrenForField(
  field: any,
  currentValue: unknown
): any[] {
  return getVisibleChildren({ ...field, value: currentValue })
}

export function getEmptyValueForType(data_type: string) {
  if (!data_type) return ''
  if (data_type.startsWith('list')) return []
  if (data_type === 'bool') return false
  if (data_type === 'number') return 0
  if (data_type === 'dict') return {}
  return ''
}
