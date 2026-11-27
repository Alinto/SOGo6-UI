import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    error_code: 0,
    error_msg: '',
    data: [
      { color: '#8b5cf6', is_default: true, name: 'Work' },
      { color: '#ef4444', is_default: false, name: '56' },
      { color: '#22c55e', is_default: false, name: 'toto' },
      { color: '#3b82f6', is_default: false, name: 'tutu' },
      { color: '', is_default: false, name: 'Facture' },
    ],
  })
}
