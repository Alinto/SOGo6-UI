'use client'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { normalizeDataArray } from '@/features/admin-panel/components/utils'
import { useDeleteDomainMutation } from '@/features/admin-panel/store/admin-panel-api'
import { Link, usePathname, useRouter } from '@/lib/i18n/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'
import { useTranslations } from 'next-intl'
import * as React from 'react'

// Builds columns dynamically from data
export function domainColumnsFromData<
  T extends { name?: string; extra_infos?: Record<string, any> },
>(data: T[] | { data?: T[] } = []): ColumnDef<any, any>[] {
  const normalized = normalizeDataArray(data)

  const extraKeys = Array.from(
    new Set(
      normalized.flatMap((d) =>
        d.extra_infos ? Object.keys(d.extra_infos) : []
      )
    )
  )

  const columns: ColumnDef<any, any>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorFn: (row) => row.name,
      id: 'name',
      header: 'Domain',
      cell: ({ row }) => {
        const domain = row.original.name ?? ''
        return (
          <Link
            href={`/admin_panel/domains/custom_domains/${encodeURIComponent(
              domain
            )}`}
            className="text-primary hover:underline"
          >
            {domain}
          </Link>
        )
      },
      enableHiding: false,
    },
    ...extraKeys.map((key) => ({
      id: `extra_${key}`,
      header: key,
      cell: ({ row }: any) => {
        const value = row.original.extra_infos?.[key]
        return <span className="text-muted-foreground">{value ?? ''}</span>
      },
      enableHiding: false,
    })),
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const domain = row.original.name
        const router = useRouter()
        const pathname = usePathname() ?? '/'
        const locale = pathname.split('/')[1] || ''
        const [confirmOpen, setConfirmOpen] = React.useState(false)
        const [deleteDomain, { isLoading }] = useDeleteDomainMutation()

        async function confirmAndDelete() {
          try {
            await deleteDomain(domain).unwrap()
            setConfirmOpen(false)
          } catch (err: any) {
            const msg =
              err?.data?.message || err?.message || 'Failed to delete domain'
            alert(msg)
          }
        }
        const t = useTranslations('ADMIN_PANNEL_DOMAIN')
        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    router.push(
                      `/${locale}/admin_panel/domains/custom_domains/${encodeURIComponent(
                        domain
                      )}`
                    )
                  }
                  className="cursor-pointer"
                >
                  Modify
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setConfirmOpen(true)}
                  className="cursor-pointer"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm deletion</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this {domain} item? This
                    action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setConfirmOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={confirmAndDelete}
                    disabled={isLoading}
                  >
                    {isLoading
                      ? t('ADMIN_PANNEL_DOMAIN.deleting')
                      : t('ADMIN_PANNEL_DOMAIN.delete')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )
      },
    },
  ]

  return columns
}
