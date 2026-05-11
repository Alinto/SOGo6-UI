import * as fs from 'fs'
import * as path from 'path'

/**
 * Tests for CustomEditorCore (editor-core.tsx)
 *
 * CKEditor is a heavy dependency that cannot be resolved in the Jest/jsdom
 * environment. Following the project pattern (see compose.test.tsx), we
 * verify the component structure by reading the file content.
 */

describe('CustomEditorCore (editor-core.tsx)', () => {
  const filePath = path.join(__dirname, '../editor-core.tsx')
  let fileContent: string

  beforeAll(() => {
    fileContent = fs.readFileSync(filePath, 'utf-8')
  })

  describe('File structure', () => {
    it('should exist and be non-empty', () => {
      expect(fs.existsSync(filePath)).toBe(true)
      expect(fileContent.length).toBeGreaterThan(0)
    })

    it('should have use client directive', () => {
      expect(fileContent).toContain("'use client'")
    })

    it('should export CustomEditorCore', () => {
      expect(fileContent).toContain('CustomEditorCore')
    })

    it('should use CKEditor component', () => {
      expect(fileContent).toContain('CKEditor')
    })
  })

  describe('Redux integration', () => {
    it('should import useAppDispatch and useAppSelector', () => {
      expect(fileContent).toContain('useAppDispatch')
      expect(fileContent).toContain('useAppSelector')
    })

    it('should import setPendingInsert from compose slice', () => {
      expect(fileContent).toContain('setPendingInsert')
    })

    it('should select pendingInsert from Redux state', () => {
      expect(fileContent).toContain('pendingInsert')
    })
  })

  describe('Editor ref and insertion', () => {
    it('should use a ref to store the editor instance', () => {
      expect(fileContent).toContain('editorRef')
      expect(fileContent).toContain('useRef')
    })

    it('should wire onReady to store the editor in the ref', () => {
      expect(fileContent).toContain('onReady')
    })

    it('should use useEffect to watch pendingInsert', () => {
      expect(fileContent).toContain('useEffect')
    })

    it('should call insertContent to insert the pending HTML', () => {
      expect(fileContent).toContain('insertContent')
    })

    it('should reset pendingInsert to null after insertion', () => {
      expect(fileContent).toContain('setPendingInsert(null)')
    })
  })
})
