import type { ContactMember, VCard } from '../address-books-types'

export function isDistributionList(contact: VCard): boolean {
  return contact.kind === 'group'
}

export function isIndividualContact(contact: VCard): boolean {
  return contact.kind !== 'group'
}

export function getDistributionListName(contact: VCard): string {
  return contact.firstName.trim()
}

export function getDistributionListMemberCount(contact: VCard): number {
  return contact.members?.length ?? 0
}

export function vCardToMember(contact: VCard): ContactMember {
  const displayName = `${contact.firstName} ${contact.lastName}`.trim()
  return {
    contactId: contact.id,
    email: contact.emails?.[0] ?? '',
    displayName: displayName || undefined,
  }
}

export function membersFromContacts(contacts: VCard[]): ContactMember[] {
  return contacts.filter(isIndividualContact).map(vCardToMember)
}

export function getMemberDisplayLabel(member: ContactMember): string {
  if (member.displayName?.trim()) {
    return member.displayName.trim()
  }
  if (member.email?.trim()) {
    return member.email.trim()
  }
  return member.contactId ?? ''
}

export function getDistributionListEmails(contact: VCard): string[] {
  if (!isDistributionList(contact)) return []
  return (contact.members ?? []).map((member) => member.email).filter(Boolean)
}
