import { NextResponse } from 'next/server'

const MOCK_USERS = [
  {
    uid: 'jdupont',
    email: 'jdupont@alinto.eu',
    name: 'Jean Dupont',
    department: 'Product',
  },
  {
    uid: 'mleblanc',
    email: 'mleblanc@alinto.eu',
    name: 'Marie Leblanc',
    department: 'Design',
  },
  {
    uid: 'pmartin',
    email: 'pmartin@alinto.eu',
    name: 'Pierre Martin',
    department: 'Sales',
  },
  {
    uid: 'srobert',
    email: 'srobert@alinto.eu',
    name: 'Sophie Robert',
    department: 'HR',
  },
  {
    uid: 'abernard',
    email: 'abernard@alinto.eu',
    name: 'Antoine Bernard',
    department: 'Engineering',
  },
  {
    uid: 'lmoreau',
    email: 'lmoreau@alinto.eu',
    name: 'Lucie Moreau',
    department: 'Marketing',
  },
  {
    uid: 'nthomas',
    email: 'nthomas@alinto.eu',
    name: 'Nicolas Thomas',
    department: 'Product',
  },
  {
    uid: 'csimon',
    email: 'csimon@alinto.eu',
    name: 'Claire Simon',
    department: 'Design',
  },
  {
    uid: 'vdubois',
    email: 'vdubois@alinto.eu',
    name: 'Victor Dubois',
    department: 'Engineering',
  },
  {
    uid: 'eleroy',
    email: 'eleroy@alinto.eu',
    name: 'Émilie Leroy',
    department: 'Marketing',
  },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') ?? '').toLowerCase().trim()
  const limitParam = searchParams.get('limit')
  const parsed = Number(limitParam ?? 10)
  const limit = Math.min(Number.isFinite(parsed) ? parsed : 10, 20)

  await new Promise((r) => setTimeout(r, 200))

  if (q.length < 2) {
    return NextResponse.json({
      data: { users: [], total: 0 },
      error_code: null,
      error_msg: null,
    })
  }

  const users = MOCK_USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  ).slice(0, limit)

  return NextResponse.json({
    data: { users, total: users.length },
    error_code: null,
    error_msg: null,
  })
}
