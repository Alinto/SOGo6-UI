import * as fs from 'fs'
import * as path from 'path'

/**
 * Tests for ComposeEditorCore (compose-editor-core.tsx)
 *
 * CKEditor is a heavy dependency that cannot be resolved in the Jest/jsdom
 * environment. Following the project pattern, we verify the component
 * structure by reading the file content.
 */
describe('ComposeEditorCore (compose-editor-core.tsx)', () => {
  const filePath = path.join(__dirname, '../compose-editor-core.tsx')
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

    it('should export ComposeEditorCore', () => {
      expect(fileContent).toContain('ComposeEditorCore')
    })

    it('should export ComposeEditorCoreProps interface', () => {
      expect(fileContent).toContain('export interface ComposeEditorCoreProps')
    })

    it('should use CKEditor component', () => {
      expect(fileContent).toContain('CKEditor')
    })

    it('should import ClassicEditor from ckeditor5', () => {
      expect(fileContent).toContain('ClassicEditor')
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

    it('should import updateBody from compose slice', () => {
      expect(fileContent).toContain('updateBody')
    })

    it('should import updateSelectedSignatureKey from compose slice', () => {
      expect(fileContent).toContain('updateSelectedSignatureKey')
    })

    it('should select pendingInsert from Redux state', () => {
      expect(fileContent).toContain('pendingInsert')
    })

    it('should select draftBody from Redux state', () => {
      expect(fileContent).toContain('draftBody')
    })

    it('should select selectedIdentity from Redux state', () => {
      expect(fileContent).toContain('selectedIdentity')
    })

    it('should select selectedSignatureKey from Redux state', () => {
      expect(fileContent).toContain('selectedSignatureKey')
    })
  })

  describe('Editor ref and insertion', () => {
    it('should use a ref to store the editor instance', () => {
      expect(fileContent).toContain('editorRef')
      expect(fileContent).toContain('useRef')
    })

    it('should wire onReady to store the editor in the ref', () => {
      expect(fileContent).toContain('onReady')
      expect(fileContent).toContain('handleReady')
    })

    it('should use useEffect to watch pendingInsert', () => {
      expect(fileContent).toContain('useEffect')
      expect(fileContent).toContain('pendingInsert')
    })

    it('should call insertContent to insert the pending HTML', () => {
      expect(fileContent).toContain('insertContent')
    })

    it('should reset pendingInsert to null after insertion', () => {
      expect(fileContent).toContain('setPendingInsert(null)')
    })

    it('should handle cursor position when inserting content', () => {
      expect(fileContent).toContain('getFirstPosition')
      expect(fileContent).toContain('setSelection')
    })
  })

  describe('Signature handling', () => {
    it('should import SignatureWidget', () => {
      expect(fileContent).toContain('SignatureWidget')
    })

    it('should define applySignature function', () => {
      expect(fileContent).toContain('applySignature')
    })

    it('should use applySignatureRef for stable reference', () => {
      expect(fileContent).toContain('applySignatureRef')
    })

    it('should handle plain text signature markers', () => {
      expect(fileContent).toContain('data-signature-marker')
    })

    it('should re-apply signature when identity changes', () => {
      expect(fileContent).toContain('selectedIdentity')
      expect(fileContent).toContain('applySignatureRef.current(editor)')
    })

    it('should re-apply signature when signature key changes', () => {
      expect(fileContent).toContain('selectedSignatureKey')
    })

    it('should track isApplyingSignature to avoid infinite loops', () => {
      expect(fileContent).toContain('isApplyingSignatureRef')
    })

    it('should dispatch updateSelectedSignatureKey when signature is deleted', () => {
      expect(fileContent).toContain('updateSelectedSignatureKey')
    })
  })

  describe('Plain text mode', () => {
    it('should import PlainTextModePlugin', () => {
      expect(fileContent).toContain('PlainTextModePlugin')
    })

    it('should set initial plain text state on ready', () => {
      expect(fileContent).toContain('setInitialState')
    })

    it('should apply plain text when mode is text', () => {
      expect(fileContent).toContain('applyPlainText')
    })

    it('should detect html mode from user preferences', () => {
      expect(fileContent).toContain('SOGO_U_COMPOSE_MAIL_TYPE_DEFAULT')
      expect(fileContent).toContain('isHtmlMode')
    })
  })

  describe('Profile integration', () => {
    it('should import useProfile', () => {
      expect(fileContent).toContain('useProfile')
    })

    it('should read preferences from profile', () => {
      expect(fileContent).toContain('preferences')
      expect(fileContent).toContain('USER_MAIL_GENERAL_SETTINGS')
    })
  })

  describe('Refs pattern', () => {
    it('should use identityRef to avoid stale closures', () => {
      expect(fileContent).toContain('identityRef')
    })

    it('should use signatureKeyRef to avoid stale closures', () => {
      expect(fileContent).toContain('signatureKeyRef')
    })

    it('should use draftIdRef to avoid stale closures', () => {
      expect(fileContent).toContain('draftIdRef')
    })

    it('should use isHtmlModeRef to avoid stale closures', () => {
      expect(fileContent).toContain('isHtmlModeRef')
    })

    it('should sync all refs in a single useEffect', () => {
      expect(fileContent).toContain('identityRef.current = selectedIdentity')
      expect(fileContent).toContain('signatureKeyRef.current = selectedSignatureKey')
      expect(fileContent).toContain('draftIdRef.current = draftId')
      expect(fileContent).toContain('isHtmlModeRef.current = isHtmlMode')
    })
  })

  describe('Editor config', () => {
    it('should use useMemo for config', () => {
      expect(fileContent).toContain('useMemo')
      expect(fileContent).toContain('config')
    })

    it('should set GPL license key', () => {
      expect(fileContent).toContain("licenseKey: 'GPL'")
    })

    it('should include plainTextMode in toolbar', () => {
      expect(fileContent).toContain("'plainTextMode'")
    })

    it('should include undo and redo in toolbar', () => {
      expect(fileContent).toContain("'undo'")
      expect(fileContent).toContain("'redo'")
    })

    it('should use locale for language config', () => {
      expect(fileContent).toContain('useLocale')
      expect(fileContent).toContain('language: locale')
    })
  })

  describe('Lifecycle', () => {
    it('should clean up editorRef on unmount', () => {
      expect(fileContent).toContain('editorRef.current = null')
    })

    it('should use useCallback for handleReady', () => {
      expect(fileContent).toContain('useCallback')
      expect(fileContent).toContain('handleReady')
    })

    it('should use useCallback for handleChange', () => {
      expect(fileContent).toContain('handleChange')
    })

    it('should register and clean up change:data listener', () => {
      expect(fileContent).toContain('change:data')
      expect(fileContent).toContain("editor.model.document.off('change:data'")
    })
  })
})