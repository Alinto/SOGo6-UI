import {
  CONTACT_EXPORT_ACCEPT,
  CONTACT_EXPORT_EXTENSIONS,
  buildContactExportFilename,
} from '../contact-transfer-formats'

describe('contact-transfer-formats', () => {
  it('maps export MIME types', () => {
    expect(CONTACT_EXPORT_ACCEPT.vcard3).toBe('text/vcard; version=3.0')
    expect(CONTACT_EXPORT_ACCEPT.json).toBe('application/json')
  })

  it('maps export file extensions', () => {
    expect(CONTACT_EXPORT_EXTENSIONS.vcard4).toBe('vcf')
    expect(CONTACT_EXPORT_EXTENSIONS.ldif).toBe('ldif')
  })

  it('builds safe export filenames', () => {
    expect(buildContactExportFilename('Work Book', 'json')).toBe('Work_Book.json')
    expect(buildContactExportFilename('   ', 'vcard3')).toBe('export.vcf')
  })
})
