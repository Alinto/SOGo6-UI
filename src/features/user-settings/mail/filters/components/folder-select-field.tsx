'use client'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { iconSelector } from '@/features/mails/components/utils'
import { useGetFoldersQuery } from '@/features/mails/store/mails-api'
import type { ImapFolder } from '@/features/mails/mails-types'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import { DynamicIcon } from 'lucide-react/dynamic'
import { useTranslations } from 'next-intl'
import { memo, useMemo, useState } from 'react'

interface FlattenedFolder extends ImapFolder {
  level: number
  key: string
}

function flattenFolders(
  folders: ImapFolder[],
  level = 0,
  parentPath = ''
): FlattenedFolder[] {
  let result: FlattenedFolder[] = []
  for (const folder of folders) {
    const key = folder.path || `${parentPath}/${folder.name}`
    result.push({ ...folder, level, key })
    if (folder.subfolders?.length) {
      result = result.concat(
        flattenFolders(folder.subfolders, level + 1, folder.path || folder.name)
      )
    }
  }
  return result
}

interface FolderSelectFieldProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  accountId?: string
  className?: string
}

function FolderSelectField({
  value,
  onChange,
  disabled = false,
  accountId = '0',
  className,
}: FolderSelectFieldProps) {
  const t = useTranslations('US_MAIL_FILTERS')
  const [open, setOpen] = useState(false)
  const { data, isLoading } = useGetFoldersQuery({ accountId })

  const folders = useMemo(() => {
    if (!data) return []
    const roots = Array.isArray(data) ? data : [data]
    return flattenFolders(roots)
  }, [data])

  const selectedFolder = folders.find(
    (folder) => (folder.path || folder.name) === value
  )
  const displayLabel =
    selectedFolder?.path || selectedFolder?.name || value || t('folder_select.placeholder.string')

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isLoading}
          className={cn(
            'h-9 w-full justify-between font-normal',
            !value && 'text-muted-foreground',
            className
          )}
          aria-label={t('folder_select.aria_label.string')}
        >
          <span className="truncate">{displayLabel}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder={t('folder_select.search.string')} />
          <CommandList className="max-h-[200px]">
            <CommandEmpty>{t('folder_select.empty.string')}</CommandEmpty>
            <CommandGroup>
              {folders.map((folder) => {
                const folderPath = folder.path || folder.name
                const isSelected = value === folderPath

                return (
                  <CommandItem
                    key={folder.key}
                    value={folderPath}
                    onSelect={() => {
                      onChange(folderPath)
                      setOpen(false)
                    }}
                    className="gap-2"
                    style={{ paddingLeft: 8 + folder.level * 12 }}
                  >
                    <DynamicIcon
                      name={iconSelector(folderPath)}
                      className="h-4 w-4 shrink-0 opacity-70"
                    />
                    <span className="truncate">{folderPath}</span>
                    <Check
                      className={cn(
                        'ml-auto h-4 w-4 shrink-0',
                        isSelected ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default memo(FolderSelectField)
