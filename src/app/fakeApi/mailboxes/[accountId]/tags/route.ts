import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    error_code: 0,
    error_msg: '',
    data: ['$Forwarded', 'Facture', 'NonJunk', 'Projet-X', '\\Seen', 'Urgent'],
  })
}
