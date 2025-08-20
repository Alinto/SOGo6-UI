import { NextResponse } from 'next/server'

// Simulated domain list
const domains: string[] = [
  'example.org',
  'sogo.nu',
  'business.com',
  'example.com',
  'test.com',
  'example.net',
  'example.edu',
  'example.io',
  'example.co.uk',
  'example.info',
  'example.biz',
  'example.us',
  'example.ca',
  'example.de',
  'example.fr',
  'example.jp',
  'example.cn',
  'example.ru',
  'example.it',
  'example.es',
  'example.au',
  'example.in',
]

// GET returns the list of domains as JSON
export async function GET() {
  return NextResponse.json(domains)
}

// OPTIONS for preflight (CORS, etc.)
export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET'] }, { status: 200 })
}
