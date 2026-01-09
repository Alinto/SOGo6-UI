import { VCard } from '@/features/address_books/address-books-types'
import { NextRequest, NextResponse } from 'next/server'

const data: VCard[] = [
  {
    id: '1',
    version: '4.0',
    firstName: 'John',
    lastName: 'Doe',
    middleName: 'A.',
    prefix: 'Mr.',
    suffix: 'Jr.',
    nickname: 'Johnny',
    title: 'Software Engineer',
    organization: 'Tech Corp',
    department: 'Development',
    jobTitle: 'Frontend Developer',
    note: 'A sample VCard entry',
    categories: ['friend', 'colleague'],
    urls: ['https://example.com'],
    photos: ['https://example.com/photo.jpg'],
    emails: ['john.doe@example.com'],
    phoneNumbers: ['+1234567890'],
    addresses: ['123 Main St, Anytown, USA'],
    impp: ['sip:john.doe@example.com'],
    geo: '37.7749,-122.4194',
    birthday: '1990-01-01',
    anniversary: '2020-01-01',
    sound: 'https://example.com/sound.mp3',
    uid: '12345',
    key: 'public-key',
  },
  {
    id: '2',
    version: '4.0',
    firstName: 'Jane',
    lastName: 'Smith',
    middleName: 'B.',
    prefix: 'Ms.',
    suffix: '',
    nickname: 'Janey',
    title: 'Project Manager',
    organization: 'Tech Corp',
    department: 'Management',
    jobTitle: 'Team Lead',
    note: 'Another sample VCard entry',
    categories: ['manager', 'colleague'],
    urls: ['https://example.org'],
    photos: ['https://example.org/photo.jpg'],
    emails: ['jane.smith@example.org'],
    phoneNumbers: ['+9876543210'],
    addresses: ['456 Elm St, Othertown, USA'],
    impp: ['sip:jane.smith@example.org'],
    geo: '40.7128,-74.0060',
    birthday: '1985-05-15',
    anniversary: '2015-06-15',
    sound: 'https://example.org/sound.mp3',
    uid: '67890',
    key: 'public-key-2',
  },
  {
    id: '3',
    version: '4.0',
    firstName: 'Brian',
    lastName: 'Topgoush',
    middleName: 'C.',
    prefix: 'Mr.',
    suffix: '',
    nickname: 'Bri',
    title: 'Designer',
    organization: 'Creative Studio',
    department: 'Design',
    jobTitle: 'UI/UX Designer',
    note: 'Creative professional',
    categories: ['designer', 'colleague'],
    urls: ['https://briantopgoush.design'],
    photos: ['https://example.com/brian.jpg'],
    emails: ['brian.topgoush@example.com'],
    phoneNumbers: ['+1122334455'],
    addresses: ['789 Design Ave, Creativetown, USA'],
    impp: ['sip:brian.topgoush@example.com'],
    geo: '34.0522,-118.2437',
    birthday: '1992-03-20',
    anniversary: '2018-09-10',
    sound: 'https://example.com/brian-sound.mp3',
    uid: '33333',
    key: 'public-key-3',
  },
  {
    id: '4',
    version: '4.0',
    firstName: 'Jocelyne',
    lastName: 'Shroud',
    middleName: 'D.',
    prefix: 'Ms.',
    suffix: '',
    nickname: 'Joss',
    title: 'Marketing Director',
    organization: 'Marketing Pro',
    department: 'Marketing',
    jobTitle: 'Marketing Director',
    note: 'Marketing expert',
    categories: ['marketing', 'manager'],
    urls: ['https://jocelyneshroud.marketing'],
    photos: ['https://example.com/jocelyne.jpg'],
    emails: ['jocelyne.shroud@example.com'],
    phoneNumbers: ['+2233445566'],
    addresses: ['321 Marketing Blvd, Promotown, USA'],
    impp: ['sip:jocelyne.shroud@example.com'],
    geo: '41.8781,-87.6298',
    birthday: '1988-07-12',
    anniversary: '2016-11-22',
    sound: 'https://example.com/jocelyne-sound.mp3',
    uid: '44444',
    key: 'public-key-4',
  },
  {
    id: '5',
    version: '4.0',
    firstName: 'Joshua',
    lastName: 'Brinston',
    middleName: 'E.',
    prefix: 'Mr.',
    suffix: '',
    nickname: 'Josh',
    title: 'Sales Manager',
    organization: 'Sales Corp',
    department: 'Sales',
    jobTitle: 'Sales Manager',
    note: 'Sales professional',
    categories: ['sales', 'manager'],
    urls: ['https://joshuabrinston.sales'],
    photos: ['https://example.com/joshua.jpg'],
    emails: ['joshua.brinston@example.com'],
    phoneNumbers: ['+3344556677'],
    addresses: ['555 Sales Street, Businesstown, USA'],
    impp: ['sip:joshua.brinston@example.com'],
    geo: '29.7604,-95.3698',
    birthday: '1991-11-05',
    anniversary: '2019-04-15',
    sound: 'https://example.com/joshua-sound.mp3',
    uid: '55555',
    key: 'public-key-5',
  },
]

export async function GET(req: NextRequest) {
  const urlParts = req.nextUrl.pathname.split('/')
  const id = urlParts[urlParts.length - 1]
  return NextResponse.json(data.find((item) => item.id === id))
}

export async function PATCH(req: NextRequest) {
  const urlParts = req.nextUrl.pathname.split('/')
  const bookIdIndex = urlParts.indexOf('address_books')
  const bookId = urlParts[bookIdIndex + 1]
  const id = urlParts[urlParts.length - 1]
  const contact = data.find((item) => item.id === id)

  if (!contact) {
    return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
  }

  const updates = await req.json()

  const { id: _, book_id: __, ...cleanUpdates } = updates
  Object.assign(contact, cleanUpdates)

  return NextResponse.json({ ...contact })
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET', 'PATCH'] }, { status: 200 })
}
