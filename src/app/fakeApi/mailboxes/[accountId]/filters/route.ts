import type { ApiFilterItem } from '@/features/user-settings/mail/filters/mail-filters-api-types'
import { NextRequest, NextResponse } from 'next/server'

const defaultFilters: ApiFilterItem[] = [
  {
    name: 'Filter 1',
    enabled: 1,
    rules: {
      op: 'and',
      rules: [
        {
          field: 'from',
          operator: 'contains',
          value: 'alinto.eu',
        },
      ],
    },
    actions: [
      {
        method: 'fileinto',
        arguments: {
          folder: 'INBOX',
          create_if_no_exist: true,
        },
      },
    ],
  },
  {
    name: 'Filter 2',
    enabled: 1,
    rules: {
      op: 'and',
      rules: [
        {
          field: 'header',
          operator: 'contains',
          custom_header: 'X-Alinto-User',
          value: 'alinto.eu',
        },
      ],
    },
    actions: [
      {
        method: 'fileinto',
        arguments: {
          folder: 'INBOX',
          create_if_no_exist: true,
        },
      },
    ],
  },
  {
    name: 'Filter 3',
    enabled: 0,
    rules: {
      op: 'and',
      rules: [
        {
          field: 'from',
          operator: 'contains',
          value: 'example.com',
        },
      ],
    },
    actions: [
      {
        method: 'fileinto',
        arguments: {
          folder: 'INBOX',
          create_if_no_exist: true,
        },
      },
    ],
  },
]

const store = new Map<string, ApiFilterItem[]>()

function getFilters(accountId: string): ApiFilterItem[] {
  if (!store.has(accountId)) {
    store.set(
      accountId,
      accountId === '0' ? structuredClone(defaultFilters) : []
    )
  }
  return store.get(accountId) ?? []
}

function apiResponse(filters: ApiFilterItem[]) {
  return {
    error_code: 'S000000',
    error_msg: 'No Error',
    data: { filters },
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const { accountId } = await params
  await new Promise((resolve) => setTimeout(resolve, 300))
  return NextResponse.json(apiResponse(getFilters(accountId)))
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const { accountId } = await params
  const body = await req.json()
  const incoming = body.filters as ApiFilterItem[] | undefined
  if (Array.isArray(incoming)) {
    store.set(accountId, incoming)
  }
  return NextResponse.json(apiResponse(getFilters(accountId)))
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET', 'POST'] }, { status: 200 })
}
