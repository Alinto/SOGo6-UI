import {
  formDialogBodyClassName,
  formDialogContentClassName,
  formDialogFooterClassName,
  formDialogHeaderClassName,
  formDialogTitleClassName,
} from '../form-dialog-layout'

describe('formDialogContentClassName', () => {
  describe('custom styling', () => {
    it('includes shared layout and mobile fullscreen classes', () => {
      const classes = formDialogContentClassName()
      expect(classes).toContain('flex')
      expect(classes).toContain('max-h-[90vh]')
      expect(classes).toContain('max-sm:h-[100dvh]')
      expect(classes).toContain('max-sm:rounded-none')
    })

    it('uses sm:max-w-2xl by default', () => {
      expect(formDialogContentClassName()).toContain('sm:max-w-2xl')
    })

    it('uses sm:max-w-lg when width is lg', () => {
      expect(formDialogContentClassName('lg')).toContain('sm:max-w-lg')
      expect(formDialogContentClassName('lg')).not.toContain('sm:max-w-2xl')
    })
  })
})

describe('formDialogHeaderClassName', () => {
  it('includes border and left-aligned text', () => {
    expect(formDialogHeaderClassName).toContain('border-b')
    expect(formDialogHeaderClassName).toContain('text-left')
  })
})

describe('formDialogTitleClassName', () => {
  it('includes title typography classes', () => {
    expect(formDialogTitleClassName).toContain('text-xl')
    expect(formDialogTitleClassName).toContain('font-semibold')
  })
})

describe('formDialogBodyClassName', () => {
  it('includes scrollable flex body classes', () => {
    expect(formDialogBodyClassName).toContain('overflow-y-auto')
    expect(formDialogBodyClassName).toContain('flex-1')
    expect(formDialogBodyClassName).toContain('scrollbar-thin-gray')
  })
})

describe('formDialogFooterClassName', () => {
  it('includes footer layout classes', () => {
    expect(formDialogFooterClassName).toContain('border-t')
    expect(formDialogFooterClassName).toContain('justify-end')
    expect(formDialogFooterClassName).toContain('gap-2')
  })
})
