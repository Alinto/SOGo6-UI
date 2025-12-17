import { ColumnDef } from '@tanstack/react-table'

export interface AdminDataTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData, any>[]
  filterColumn?: string
  filterPlaceholder?: string
  actionButtonLabel?: string
}
