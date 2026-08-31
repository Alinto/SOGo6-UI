import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu'
import { Check } from 'lucide-react'
import { DynamicIcon } from 'lucide-react/dynamic'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { AutoSizer, List } from 'react-virtualized'
import { ImapFolder } from '../mails-types'
import { useGetFoldersQuery } from '../store/mails-api'
import { iconSelectorByType } from './utils'

export interface FlattenedFolder extends ImapFolder {
  level: number
  key: string
}

export function flattenFolders(
  folders: ImapFolder[],
  level = 0,
  parentPath = ''
): FlattenedFolder[] {
  let result: FlattenedFolder[] = []
  for (const f of folders) {
    result.push({ ...f, level, key: f.path || `${parentPath}/${f.name}` })
    if (f.subfolders?.length) {
      result = result.concat(
        flattenFolders(f.subfolders, level + 1, f.path || f.name)
      )
    }
  }
  return result
}

interface SearchFoldersProps {
  value: string
  onValueChange: (path: string) => void
  accountId?: string
  pinnedPaths?: string[]
}

const SearchFolders = ({
  value,
  onValueChange,
  accountId,
  pinnedPaths = [],
}: SearchFoldersProps) => {
  const { data } = useGetFoldersQuery({ accountId })
  const [search, setSearch] = useState('')
  const t = useTranslations('MAILS_COMMONS')
  // Flatten only filtered folders
  const filteredData = useMemo(() => {
    // Recursive filter function
    const filterFolders = (
      folders: ImapFolder[],
      query: string
    ): ImapFolder[] => {
      if (!query) return folders
      return folders
        .map((folder: ImapFolder): ImapFolder | null => {
          const filteredSubfolders = folder.subfolders
            ? filterFolders(folder.subfolders, query)
            : undefined
          if (
            folder.name.toLowerCase().includes(query.toLowerCase()) ||
            (filteredSubfolders && filteredSubfolders.length > 0)
          ) {
            return { ...folder, subfolders: filteredSubfolders }
          }
          return null
        })
        .filter((folder): folder is ImapFolder => folder !== null)
    }

    return data
      ? flattenFolders(
          filterFolders(Array.isArray(data) ? data : [data], search)
        )
      : []
  }, [data, search])

  const selectedFolder = useMemo(() => {
    if (pinnedPaths.includes(value)) return undefined
    return flattenFolders(
      Array.isArray(data) ? data : data ? [data] : []
    ).find((f) => f.path === value)
  }, [data, value, pinnedPaths])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={selectedFolder ? 'default' : 'outline'}>
          {selectedFolder ? selectedFolder.name : t('search.others.string')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search.folders.string')}
          />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-96 w-72 overflow-y-auto p-0">
          <div style={{ height: 384, width: 288 }}>
            <AutoSizer>
              {({ height, width }) => (
                <List
                  width={width}
                  height={height}
                  rowCount={filteredData.length}
                  rowHeight={36}
                  rowRenderer={({ index, key, style }) => {
                    const f = filteredData[index]
                    return (
                      <div key={key} style={style}>
                        <DropdownMenuItem
                          className="hover:bg-accent flex cursor-pointer items-center truncate rounded-md px-2"
                          style={{ paddingLeft: f.level * 20 }}
                          aria-selected={f.path === value}
                          onClick={() => onValueChange(f.path)}
                        >
                          <DynamicIcon
                            name={iconSelectorByType(f.type)}
                            className="mr-2 h-4 w-4"
                          />
                          {f.name}
                          {f.path === value && (
                            <Check className="ml-auto h-4 w-4" />
                          )}
                        </DropdownMenuItem>
                      </div>
                    )
                  }}
                />
              )}
            </AutoSizer>
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default SearchFolders
