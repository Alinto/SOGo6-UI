import type { ApiFilterItem } from '@/features/user-settings/mail/filters/mail-filters-api-types'
import { NextRequest, NextResponse } from 'next/server'

const data: ApiFilterItem[] = [
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

function apiResponse(filters: ApiFilterItem[]) {
  return {
    error_code: 'S000000',
    error_msg: 'No Error',
    data: { filters },
  }
}

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return NextResponse.json(apiResponse(data))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const incoming = body.filters as ApiFilterItem[] | undefined
  if (Array.isArray(incoming)) {
    data.length = 0
    data.push(...incoming)
  }
  return NextResponse.json(apiResponse(data))
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET', 'POST'] }, { status: 200 })
}
