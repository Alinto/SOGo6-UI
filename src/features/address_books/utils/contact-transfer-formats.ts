export type ContactTransferFormat = 'json' | 'vcard3' | 'vcard4' | 'ldif'

export type ContactImportScope = 'new_book' | 'contacts' | 'lists'

export const CONTACT_EXPORT_ACCEPT: Record<ContactTransferFormat, string> = {
  vcard3: 'text/vcard; version=3.0',
  vcard4: 'text/vcard; version=4.0',
  ldif: 'text/ldif',
  json: 'application/json',
}

export const CONTACT_EXPORT_EXTENSIONS: Record<ContactTransferFormat, string> = {
  vcard3: 'vcf',
  vcard4: 'vcf',
  ldif: 'ldif',
  json: 'json',
}

export function buildContactExportFilename(
  baseName: string,
  format: ContactTransferFormat
): string {
  const safeName = baseName.trim().replace(/[^\w.-]+/g, '_') || 'export'
  return `${safeName}.${CONTACT_EXPORT_EXTENSIONS[format]}`
}
