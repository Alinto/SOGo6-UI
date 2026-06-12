import type { ContactMember, VCard } from '@/features/address_books/address-books-types'

export function buildVCardFromBody(
  body: Partial<VCard> & { id: string }
): VCard {
  const isGroup = body.kind === 'group'

  return {
    id: body.id,
    version: '4.0',
    kind: body.kind ?? 'individual',
    members: isGroup ? (body.members ?? []) : undefined,
    firstName: body.firstName || '',
    lastName: isGroup ? '' : body.lastName || '',
    middleName: body.middleName,
    prefix: body.prefix,
    suffix: body.suffix,
    nickname: body.nickname,
    title: body.title,
    organization: body.organization,
    department: body.department,
    jobTitle: body.jobTitle,
    note: body.note,
    categories: body.categories || [],
    urls: body.urls || [],
    photos: body.photos || [],
    emails: isGroup ? [] : body.emails || [],
    phoneNumbers: isGroup ? [] : body.phoneNumbers || [],
    addresses: isGroup ? [] : body.addresses || [],
    impp: body.impp || [],
    geo: body.geo,
    birthday: body.birthday,
    anniversary: body.anniversary,
    sound: body.sound,
    uid: body.uid,
    key: body.key,
    created_at: body.created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

export function removeContactFromDistributionLists(
  userVCards: Record<string, VCard[]>,
  bookId: string,
  contactId: string
): void {
  const contacts = userVCards[bookId] ?? []
  for (const entry of contacts) {
    if (entry.kind !== 'group' || !entry.members?.length) continue
    entry.members = entry.members.filter(
      (member) => member.contactId !== contactId
    )
    entry.updated_at = new Date().toISOString()
  }
}

export function removeContactFromAllDistributionLists(
  userVCards: Record<string, VCard[]>,
  contactId: string
): void {
  for (const bookId of Object.keys(userVCards)) {
    removeContactFromDistributionLists(userVCards, bookId, contactId)
  }
}

export function normalizeGroupMembersForBook(
  bookContacts: VCard[],
  members: ContactMember[] | undefined
): ContactMember[] {
  if (!members?.length) return []

  const contactIds = new Set(bookContacts.map((contact) => contact.id))

  return normalizeGroupMembers(
    members.map((member) => {
      if (member.contactId && !contactIds.has(member.contactId)) {
        return {
          email: member.email,
          displayName: member.displayName,
        }
      }
      return member
    })
  )
}

export function normalizeGroupMembers(
  members: ContactMember[] | undefined
): ContactMember[] {
  if (!members?.length) return []
  const seen = new Set<string>()
  return members.filter((member) => {
    const email = member.email?.trim().toLowerCase() ?? ''
    if (member.contactId) {
      const key = email || `contact:${member.contactId}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    }
    if (!email || seen.has(email)) return false
    seen.add(email)
    return true
  })
}
