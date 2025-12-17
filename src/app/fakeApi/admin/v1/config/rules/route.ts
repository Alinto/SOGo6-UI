import { Rule } from '@/features/admin-panel/types/rule'
import { NextResponse } from 'next/server'

const rules: Rule[] = [
  { id: 1, name: 'suisse' },
  { id: 2, name: 'Université' },
  { id: 3, name: 'France' },
  { id: 4, name: 'SOGo' },
  { id: 5, name: 'Test Rule' },
  { id: 6, name: 'Example Rule' },
  { id: 7, name: 'Demo Rule' },
  { id: 8, name: 'Sample Rule' },
  { id: 9, name: 'Custom Rule' },
  { id: 10, name: 'Admin Rule' },
  { id: 11, name: 'User Rule' },
  { id: 12, name: 'Guest Rule' },
  { id: 13, name: 'Public Rule' },
  { id: 14, name: 'Private Rule' },
  { id: 15, name: 'Restricted Rule' },
]

export async function GET() {
  return NextResponse.json(rules)
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET'] }, { status: 200 })
}
