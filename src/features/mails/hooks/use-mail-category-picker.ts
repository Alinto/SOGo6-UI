'use client'

import { DEFAULT_COLORS } from '@/components/ui/color-picker'
import {
  useGetUserPreferencesQuery,
  useUpdateUserPreferencesMailCategoryMutation,
} from '@/features/user-settings/store/user-preferences-api'
import { useCallback, useEffect, useMemo, useState } from 'react'

export type MailCategoryOption = {
  name: string
  color: string
  is_default: boolean
}

/**
 * Shared category loading/creation logic for the single-mail and bulk label
 * picker dialogs: fetches the user's categories, merges in not-yet-saved
 * ("pending") ones created from the dialog, and persists pending categories
 * on apply.
 */
export function useMailCategoryPicker(open: boolean) {
  const { data, isFetching } = useGetUserPreferencesQuery(undefined, {
    skip: !open,
  })
  const [updateCategories] = useUpdateUserPreferencesMailCategoryMutation()
  const [pendingCategories, setPendingCategories] = useState<
    { name: string; color: string }[]
  >([])
  const [showNewTag, setShowNewTag] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(DEFAULT_COLORS[0])

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets picker-local state when the dialog opens
      setPendingCategories([])
      setShowNewTag(false)
      setNewTagName('')
      setNewTagColor(DEFAULT_COLORS[0])
    }
  }, [open])

  const categories = useMemo(
    () => data?.data.USER_MAIL_CATEGORY_SETTINGS?.SOGO_U_MAIL_CATEGORIES ?? [],
    [data]
  )

  const allCategories = useMemo<MailCategoryOption[]>(() => {
    const confirmedNames = new Set(
      categories.map((category) => category.name.toLowerCase())
    )
    const unconfirmedPending = pendingCategories.filter(
      (category) => !confirmedNames.has(category.name.toLowerCase())
    )
    return [
      ...categories,
      ...unconfirmedPending.map((category) => ({
        name: category.name,
        color: category.color,
        is_default: false,
      })),
    ].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    )
  }, [categories, pendingCategories])

  const trimmedNewTagName = newTagName.trim()

  const isDuplicateTagName = useMemo(() => {
    if (!trimmedNewTagName) return false
    return allCategories.some(
      (category) =>
        category.name.toLowerCase() === trimmedNewTagName.toLowerCase()
    )
  }, [trimmedNewTagName, allCategories])

  const cancelNewTag = useCallback(() => {
    setShowNewTag(false)
    setNewTagName('')
    setNewTagColor(DEFAULT_COLORS[0])
  }, [])

  const handleCreateTag = useCallback(
    (onCreated: (name: string) => void) => {
      const name = newTagName.trim()
      if (!name || isDuplicateTagName) return
      setPendingCategories((prev) => [...prev, { name, color: newTagColor }])
      setNewTagName('')
      setNewTagColor(DEFAULT_COLORS[0])
      setShowNewTag(false)
      onCreated(name)
    },
    [newTagName, newTagColor, isDuplicateTagName]
  )

  /**
   * Persists any pending (not-yet-saved) categories. The mutation already
   * surfaces an error notification via its own onQueryStarted handler, so
   * callers only need the boolean result to decide whether to continue.
   */
  const savePendingCategories = useCallback(async () => {
    if (pendingCategories.length === 0) return true
    try {
      await updateCategories({
        SOGO_U_MAIL_CATEGORIES: allCategories,
      }).unwrap()
      return true
    } catch {
      return false
    }
  }, [pendingCategories, allCategories, updateCategories])

  return {
    isFetching,
    allCategories,
    showNewTag,
    setShowNewTag,
    newTagName,
    setNewTagName,
    newTagColor,
    setNewTagColor,
    isDuplicateTagName,
    cancelNewTag,
    handleCreateTag,
    savePendingCategories,
  }
}
