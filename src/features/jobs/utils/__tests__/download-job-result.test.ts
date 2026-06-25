import {
  downloadBlobAsFile,
  filenameFromContentDisposition,
} from '../download-job-result'

describe('download-job-result', () => {
  describe('filenameFromContentDisposition', () => {
    it('returns fallback when header is missing', () => {
      expect(filenameFromContentDisposition(null, 'export.vcf')).toBe('export.vcf')
    })

    it('parses UTF-8 filename', () => {
      expect(
        filenameFromContentDisposition(
          "attachment; filename*=UTF-8''contacts%2Evcf",
          'export.vcf'
        )
      ).toBe('contacts.vcf')
    })

    it('parses quoted filename', () => {
      expect(
        filenameFromContentDisposition('attachment; filename="book.json"', 'export.json')
      ).toBe('book.json')
    })
  })

  describe('downloadBlobAsFile', () => {
    it('creates a temporary anchor and clicks it', () => {
      const click = jest.fn()
      const originalCreateObjectURL = URL.createObjectURL
      const originalRevokeObjectURL = URL.revokeObjectURL

      URL.createObjectURL = jest.fn(() => 'blob:mock')
      URL.revokeObjectURL = jest.fn()

      jest.spyOn(document.body, 'appendChild').mockImplementation((node) => node)
      jest.spyOn(document.body, 'removeChild').mockImplementation((node) => node)
      jest.spyOn(document, 'createElement').mockReturnValue({
        click,
        style: {},
      } as unknown as HTMLAnchorElement)

      downloadBlobAsFile(new Blob(['test']), 'export.vcf')

      expect(URL.createObjectURL).toHaveBeenCalled()
      expect(click).toHaveBeenCalled()
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock')

      URL.createObjectURL = originalCreateObjectURL
      URL.revokeObjectURL = originalRevokeObjectURL
      jest.restoreAllMocks()
    })
  })
})
