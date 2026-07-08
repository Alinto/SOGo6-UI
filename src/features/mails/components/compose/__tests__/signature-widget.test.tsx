import * as fs from 'fs'
import * as path from 'path'

/**
 * Tests for SignatureWidget (signature-widget.ts)
 *
 * CKEditor is a heavy dependency that cannot be resolved in the Jest/jsdom
 * environment. Following the project pattern, we verify the component
 * structure by reading the file content.
 */
describe('SignatureWidget (signature-widget.ts)', () => {
  const filePath = path.join(__dirname, '../signature-widget.tsx')
  let fileContent: string

  beforeAll(() => {
    fileContent = fs.readFileSync(filePath, 'utf-8')
  })

  describe('File structure', () => {
    it('should exist and be non-empty', () => {
      expect(fs.existsSync(filePath)).toBe(true)
      expect(fileContent.length).toBeGreaterThan(0)
    })

    it('should export SignatureWidget', () => {
      expect(fileContent).toContain('export class SignatureWidget')
    })

    it('should extend Plugin', () => {
      expect(fileContent).toContain('extends Plugin')
    })

    it('should import Command, Plugin and toWidget from ckeditor5', () => {
      expect(fileContent).toContain('Command')
      expect(fileContent).toContain('Plugin')
      expect(fileContent).toContain('toWidget')
      expect(fileContent).toMatch(
        /import\s*{[^}]*Command[^}]*}\s*from\s*['"]ckeditor5['"]/
      )
    })

    it('should define pluginName as SignatureWidget', () => {
      expect(fileContent).toContain("return 'SignatureWidget'")
    })

    it('should define an init method', () => {
      expect(fileContent).toContain('init()')
    })
  })

  describe('SetSignatureCommand', () => {
    it('should define SetSignatureCommand class', () => {
      expect(fileContent).toContain('class SetSignatureCommand')
    })

    it('should extend Command', () => {
      expect(fileContent).toContain('class SetSignatureCommand extends Command')
    })

    it('should define execute method', () => {
      expect(fileContent).toContain('execute(')
    })

    it('should define refresh method', () => {
      expect(fileContent).toContain('refresh()')
    })

    it('should set isEnabled to true in refresh', () => {
      expect(fileContent).toContain('this.isEnabled = true')
    })

    it('should accept key, content and identitySignatures params', () => {
      expect(fileContent).toContain('key')
      expect(fileContent).toContain('content')
      expect(fileContent).toContain('identitySignatures')
    })

    it('should handle "none" key by removing existing signature', () => {
      expect(fileContent).toContain("key === 'none'")
      expect(fileContent).toContain('writer.remove(existing)')
    })

    it('should update existing signature attributes when it exists', () => {
      expect(fileContent).toContain("writer.setAttribute('data-content'")
      expect(fileContent).toContain("writer.setAttribute('data-selected-key'")
      expect(fileContent).toContain("writer.setAttribute('data-signatures'")
    })

    it('should create new signature element when none exists', () => {
      expect(fileContent).toContain("writer.createElement('signature'")
    })

    it('should use insertContent to insert new signature', () => {
      expect(fileContent).toContain('insertContent(el)')
    })

    it('should use model.change with writer', () => {
      expect(fileContent).toContain('this.editor.model.change((writer)')
    })

    it('should get document root', () => {
      expect(fileContent).toContain('this.editor.model.document.getRoot()')
    })
  })

  describe('Schema registration', () => {
    it('should register signature schema', () => {
      expect(fileContent).toContain("schema.register('signature'")
    })

    it('should set isObject on schema', () => {
      expect(fileContent).toContain('isObject: true')
    })

    it('should set isBlock on schema', () => {
      expect(fileContent).toContain('isBlock: true')
    })

    it('should set allowWhere to $block', () => {
      expect(fileContent).toContain("allowWhere: '$block'")
    })

    it('should allow data-content attribute', () => {
      expect(fileContent).toContain("'data-content'")
    })

    it('should allow data-signatures attribute', () => {
      expect(fileContent).toContain("'data-signatures'")
    })

    it('should allow data-selected-key attribute', () => {
      expect(fileContent).toContain("'data-selected-key'")
    })
  })

  describe('View rendering', () => {
    it('should define renderSection helper', () => {
      expect(fileContent).toContain('renderSection')
    })

    it('should create section container element with signature-widget class', () => {
      expect(fileContent).toContain("class: 'signature-widget'")
    })

    it('should set data-widget attribute on section', () => {
      expect(fileContent).toContain("'data-widget': 'signature'")
    })

    it('should apply user-select none to prevent text selection', () => {
      expect(fileContent).toContain('user-select: none')
    })

    it('should apply pointer-events none on content wrapper', () => {
      expect(fileContent).toContain('pointer-events: none')
    })

    it('should create hr separator element', () => {
      expect(fileContent).toContain("'hr'")
      expect(fileContent).toContain('signature-widget__separator')
    })

    it('should create content wrapper div', () => {
      expect(fileContent).toContain('signature-widget__content')
    })

    it('should set innerHTML on content wrapper', () => {
      expect(fileContent).toContain('domElement.innerHTML = content')
    })

    it('should use createRawElement for content wrapper', () => {
      expect(fileContent).toContain('createRawElement')
    })
  })

  describe('Conversion — editing downcast', () => {
    it('should register editingDowncast conversion', () => {
      expect(fileContent).toContain("conversion.for('editingDowncast')")
    })

    it('should use elementToStructure for editing downcast', () => {
      expect(fileContent).toMatch(
        /editingDowncast\(\)\.elementToStructure|editingDowncast'\)[\s\S]*?elementToStructure/
      )
    })

    it('should include data-content in editing downcast model attributes', () => {
      expect(fileContent).toContain('data-content')
    })

    it('should wrap section with toWidget', () => {
      expect(fileContent).toContain('toWidget(section, writer')
    })

    it('should set widget label as Signature', () => {
      expect(fileContent).toContain("label: 'Signature'")
    })

    it('should enable selection handle on widget', () => {
      expect(fileContent).toContain('hasSelectionHandle: true')
    })
  })

  describe('Conversion — data downcast', () => {
    it('should register dataDowncast conversion', () => {
      expect(fileContent).toContain("conversion.for('dataDowncast')")
    })

    it('should use elementToStructure for data downcast', () => {
      expect(fileContent).toMatch(
        /dataDowncast\(\)\.elementToStructure|dataDowncast'\)[\s\S]*?elementToStructure/
      )
    })

    it('should read data-content attribute for rendering', () => {
      expect(fileContent).toContain("getAttribute('data-content')")
    })
  })

  describe('Conversion — upcast', () => {
    it('should register upcast conversion', () => {
      expect(fileContent).toContain("conversion.for('upcast')")
    })

    it('should use elementToElement for upcast', () => {
      expect(fileContent).toMatch(
        /upcast\(\)\.elementToElement|upcast'\)[\s\S]*?elementToElement/
      )
    })

    it('should match section elements with signature-widget class on upcast', () => {
      expect(fileContent).toContain("name: 'section'")
      expect(fileContent).toContain("classes: 'signature-widget'")
    })

    it('should read data-content from view element on upcast', () => {
      expect(fileContent).toContain("viewElement.getAttribute('data-content')")
    })

    it('should read data-signatures from view element on upcast', () => {
      expect(fileContent).toContain(
        "viewElement.getAttribute('data-signatures')"
      )
    })

    it('should read data-selected-key from view element on upcast', () => {
      expect(fileContent).toContain(
        "viewElement.getAttribute('data-selected-key')"
      )
    })

    it('should default data-signatures to empty object string', () => {
      expect(fileContent).toContain("'{}'")
    })
  })

  describe('Command registration', () => {
    it('should register setSignature command', () => {
      expect(fileContent).toContain("editor.commands.add('setSignature'")
    })

    it('should instantiate SetSignatureCommand with editor', () => {
      expect(fileContent).toContain('new SetSignatureCommand(editor)')
    })
  })
})
