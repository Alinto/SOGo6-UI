export type EmailContact = {
  name?: string
  email: string
}

export function formatEmailContact(contact: EmailContact): string {
  const name = contact.name?.trim() ?? ''
  const email = contact.email?.trim() ?? ''
  if (name && email) {
    return `${name} <${email}>`
  }
  return email || name
}
