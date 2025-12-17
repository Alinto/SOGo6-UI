'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import {
  normalizeDataArray,
  NormalizedDomain,
} from '@/features/admin-panel/components/utils'
import { useSaveCustomDomainConfigMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useRouter } from '@/lib/i18n/navigation'
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table'
import { useTranslations } from 'next-intl'
import * as React from 'react'
import { AdminDataTableProps } from '../types/admin-data-table'

export function AdminDataTable<TData>({
  data,
  columns,
  filterColumn,
  filterPlaceholder,
  actionButtonLabel,
}: AdminDataTableProps<TData>) {
  const t = useTranslations('')
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const router = useRouter()

  const normalizedData: NormalizedDomain[] = React.useMemo(() => {
    return normalizeDataArray(data)
  }, [data])

  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [newDomainName, setNewDomainName] = React.useState('')
  const [newDomainDescription, setNewDomainDescription] = React.useState('')

  const [saveCustomDomainConfig, { isLoading: isSaving }] =
    useSaveCustomDomainConfigMutation()

  const table = useReactTable({
    data: normalizedData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  function openCreateDialog() {
    setNewDomainName('')
    setNewDomainDescription('')
    setIsDialogOpen(true)
  }

  async function handleCreateConfirm(e?: React.FormEvent) {
    if (e) e.preventDefault()
    const val = (newDomainName || '').trim()
    const desc = (newDomainDescription || '').trim()
    if (!val) {
      alert('Please enter a domain name') //TODO: toast avec trad
      return
    }
    if (!desc) {
      alert('Please enter a domain description') //TODO: toast avec trad
      return
    }

    const domainId = encodeURIComponent(val.toLowerCase())
    const target = `/admin_panel/domains/custom_domains/${domainId}`

    try {
      await saveCustomDomainConfig({
        customDomainId: domainId,
        config: {
          domain_name: val,
          domain_description: desc,
        },
      })

      setIsDialogOpen(false)
      router.push(target)
    } catch (err: any) {
      const msg =
        err?.data?.message || err?.message || 'Failed to create custom domain'
      alert(msg)
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 py-4">
        {filterColumn && (
          <Input
            placeholder={filterPlaceholder}
            value={
              (table.getColumn(filterColumn)?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table.getColumn(filterColumn)?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        )}
        <div className="flex-1" />
        <Button variant="default" onClick={openCreateDialog}>
          {actionButtonLabel}
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add custom domain</DialogTitle>
            <DialogDescription>
              Enter the custom domain name you want to add.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateConfirm} className="mt-2 space-y-4">
            <Input
              placeholder="Enter custom domain name"
              value={newDomainName}
              onChange={(e) => setNewDomainName(e.target.value)}
              aria-label="Custom domain name"
              autoFocus
            />

            <Textarea
              placeholder="Enter custom domain description here"
              value={newDomainDescription}
              onChange={(e) => setNewDomainDescription(e.target.value)}
              aria-label="Custom domain description"
              className="min-h-30"
            />

            <DialogFooter className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !newDomainName.trim() ||
                  !newDomainDescription.trim() ||
                  isSaving
                }
                className="ml-2"
              >
                {isSaving
                  ? t('ADMIN_PANNEL_DOMAIN.adding.string')
                  : t('ADMIN_PANNEL_DOMAIN.add.string')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {t('DATA_TABLE.no_result.string')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {t('DATA_TABLE.selected.string', {
            selected: table.getFilteredSelectedRowModel().rows.length,
            total: table.getFilteredRowModel().rows.length,
          })}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {t('DATA_TABLE.previous.string')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {t('DATA_TABLE.next.string')}
          </Button>
        </div>
      </div>
    </div>
  )
}
