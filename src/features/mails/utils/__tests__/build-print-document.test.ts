import { buildPrintDocument } from '../build-print-document'

const labels = {
  from: 'From',
  to: 'To',
  cc: 'Cc',
  date: 'Date',
  attachments: 'Attachments',
}

describe('buildPrintDocument', () => {
  it('builds a printable html document with escaped metadata', () => {
    const html = buildPrintDocument({
      subject: 'Test <subject>',
      from: 'Alice <alice@example.com>',
      to: ['Bob <bob@example.com>'],
      date: 'April 20, 2026 10:00',
      body: '<p>Hello <strong>world</strong></p>',
      labels,
    })

    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('Test &lt;subject&gt;')
    expect(html).toContain('Alice &lt;alice@example.com&gt;')
    expect(html).toContain('<p>Hello <strong>world</strong></p>')
    expect(html).not.toContain('Test <subject>')
  })

  it('includes cc and attachments when provided', () => {
    const html = buildPrintDocument({
      subject: 'With extras',
      from: 'Alice',
      to: ['Bob'],
      cc: ['Carol'],
      date: 'Today',
      body: '<p>Body</p>',
      attachmentNames: ['report.pdf'],
      labels,
    })

    expect(html).toContain('Cc:')
    expect(html).toContain('Carol')
    expect(html).toContain('Attachments:')
    expect(html).toContain('report.pdf')
  })
})
