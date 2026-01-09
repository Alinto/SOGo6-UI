import { VCard } from '@/features/address_books/address-books-types'
import { NextRequest, NextResponse } from 'next/server'
import { addressBooksData } from '../data'

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ book_id: string }> }
) {
  const { book_id } = await params

  // Vérifier si c'est une requête pour un AddressBook ou un VCard
  // Si book_id correspond à un AddressBook, retourner les VCards de cet AddressBook
  // Sinon, vérifier si c'est une requête pour modifier/supprimer un AddressBook

  // Pour l'instant, on retourne les VCards comme avant
  return NextResponse.json(data)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ book_id: string }> }
) {
  const { book_id } = await params
  const body = await req.json()
  const { name, description } = body

  // Chercher dans tous les tableaux d'AddressBooks
  let addressBook:
    | (
        | (typeof addressBooksData.personals)[0]
        | (typeof addressBooksData.subscriptions)[0]
        | (typeof addressBooksData.globals)[0]
      )
    | undefined

  addressBook = addressBooksData.personals.find((book) => book.id === book_id)

  if (!addressBook) {
    addressBook = addressBooksData.subscriptions.find(
      (book) => book.id === book_id
    )
  }

  if (!addressBook) {
    addressBook = addressBooksData.globals.find((book) => book.id === book_id)
  }

  if (!addressBook) {
    return NextResponse.json(
      { error: 'Address book not found' },
      { status: 404 }
    )
  }

  if (name) addressBook.name = name
  if (description !== undefined) addressBook.description = description

  return NextResponse.json(addressBook)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ book_id: string }> }
) {
  const { book_id } = await params

  // Chercher et supprimer dans tous les tableaux
  const personalIndex = addressBooksData.personals.findIndex(
    (book) => book.id === book_id
  )
  if (personalIndex !== -1) {
    addressBooksData.personals.splice(personalIndex, 1)
    return NextResponse.json({ success: true }, { status: 200 })
  }

  const subscriptionIndex = addressBooksData.subscriptions.findIndex(
    (book) => book.id === book_id
  )
  if (subscriptionIndex !== -1) {
    addressBooksData.subscriptions.splice(subscriptionIndex, 1)
    return NextResponse.json({ success: true }, { status: 200 })
  }

  const globalIndex = addressBooksData.globals.findIndex(
    (book) => book.id === book_id
  )
  if (globalIndex !== -1) {
    addressBooksData.globals.splice(globalIndex, 1)
    return NextResponse.json({ success: true }, { status: 200 })
  }

  return NextResponse.json({ error: 'Address book not found' }, { status: 404 })
}

export async function OPTIONS() {
  return NextResponse.json(
    { allow: ['GET', 'PATCH', 'DELETE'] },
    { status: 200 }
  )
}
