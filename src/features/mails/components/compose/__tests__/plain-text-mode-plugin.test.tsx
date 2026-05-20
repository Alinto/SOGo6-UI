import * as fs from 'fs'
import * as path from 'path'

/**
 * Tests for PlainTextModePlugin (plain-text-mode-plugin.ts)
 *
 * CKEditor is a heavy dependency that cannot be resolved in the Jest/jsdom
 * environment. Following the project pattern, we verify the plugin
 * structure by reading the file content.
 */
describe('PlainTextModePlugin (plain-text-mode-plugin.ts)', () => {
  const filePath = path.join(__dirname, '../plain-text-mode-plugin.tsx')

  let fileContent: string

  beforeAll(() => {
    fileContent = fs.readFileSync(filePath, 'utf-8')
  })

  describe('File structure', () => {
    it('should exist and be non-empty', () => {
      expect(fs.existsSync(filePath)).toBe(true)
      expect(fileContent.length).toBeGreaterThan(0)
    })

    it('should export PlainTextModePlugin', () => {
      expect(fileContent).toContain('export class PlainTextModePlugin')
    })

    it('should extend Plugin', () => {
      expect(fileContent).toContain('extends Plugin')
    })

    it('should import ButtonView and Plugin from ckeditor5', () => {
      expect(fileContent).toMatch(
        /import\s*{[^}]*ButtonView[^}]*Plugin[^}]*}\s*from\s*['"]ckeditor5['"]/
      )
    })

    it('should define pluginName as PlainTextModePlugin', () => {
      expect(fileContent).toContain("return 'PlainTextModePlugin'")
    })

    it('should define an init method', () => {
      expect(fileContent).toContain('init()')
    })
  })

  describe('Private fields', () => {
    it('should define _isPlainText boolean field defaulting to false', () => {
      expect(fileContent).toContain('private _isPlainText: boolean = false')
    })

    it('should define _buttonView field', () => {
      expect(fileContent).toContain(
        'private _buttonView: ButtonView | null = null'
      )
    })

    it('should define _onToggle callback field', () => {
      expect(fileContent).toContain('private _onToggle')
    })

    it('should define _setApplyingFlag callback field', () => {
      expect(fileContent).toContain('private _setApplyingFlag')
    })
  })

  describe('Public API', () => {
    it('should expose isPlainText getter', () => {
      expect(fileContent).toContain('get isPlainText(): boolean')
      expect(fileContent).toContain('return this._isPlainText')
    })

    it('should expose setApplyingFlagCallback method', () => {
      expect(fileContent).toContain('setApplyingFlagCallback')
      expect(fileContent).toContain('this._setApplyingFlag = cb')
    })

    it('should expose setInitialState method', () => {
      expect(fileContent).toContain('setInitialState(isPlainText: boolean)')
    })

    it('should set _isPlainText in setInitialState', () => {
      expect(fileContent).toContain('this._isPlainText = isPlainText')
    })

    it('should call _syncButton in setInitialState', () => {
      expect(fileContent).toMatch(/setInitialState[\s\S]*?_syncButton/)
    })

    it('should expose setOnToggle method', () => {
      expect(fileContent).toContain('setOnToggle(cb')
      expect(fileContent).toContain('this._onToggle = cb')
    })
  })

  describe('_syncButton', () => {
    it('should define _syncButton private method', () => {
      expect(fileContent).toContain('private _syncButton()')
    })

    it('should set buttonView.isOn to _isPlainText', () => {
      expect(fileContent).toContain('this._buttonView.isOn = this._isPlainText')
    })

    it('should guard against null _buttonView', () => {
      expect(fileContent).toMatch(/if\s*\(\s*this\._buttonView\s*\)/)
    })
  })

  describe('stripHtml', () => {
    it('should define stripHtml method', () => {
      expect(fileContent).toContain('stripHtml(html: string): string')
    })

    it('should replace <br> tags with newlines', () => {
      expect(fileContent).toContain('<br')
      expect(fileContent).toContain("'\\n'")
    })

    it('should replace </p> tags with newlines', () => {
      expect(fileContent).toContain('<\\/p>')
    })

    it('should replace </div> tags with newlines', () => {
      expect(fileContent).toContain('<\\/div>')
    })

    it('should replace </li> tags with newlines', () => {
      expect(fileContent).toContain('<\\/li>')
    })

    it('should strip all remaining HTML tags', () => {
      expect(fileContent).toContain('<[^>]+>')
    })

    it('should replace &nbsp; with space', () => {
      expect(fileContent).toContain('&nbsp;')
    })

    it('should replace &amp; with &', () => {
      expect(fileContent).toContain('&amp;')
    })

    it('should replace &lt; with <', () => {
      expect(fileContent).toContain('&lt;')
    })

    it('should replace &gt; with >', () => {
      expect(fileContent).toContain('&gt;')
    })

    it('should replace &quot; with quote', () => {
      expect(fileContent).toContain('&quot;')
    })

    it('should collapse triple+ newlines to double newline', () => {
      expect(fileContent).toContain('\\n{3,}')
    })

    it('should trim the result', () => {
      expect(fileContent).toContain('.trim()')
    })
  })

  describe('applyPlainText', () => {
    it('should define applyPlainText method', () => {
      expect(fileContent).toContain('applyPlainText()')
    })

    it('should get current HTML via editor.getData()', () => {
      expect(fileContent).toMatch(/applyPlainText[\s\S]*?editor\.getData\(\)/)
    })

    it('should call stripHtml to convert content', () => {
      expect(fileContent).toMatch(/applyPlainText[\s\S]*?stripHtml/)
    })

    it('should wrap each line in a paragraph tag', () => {
      expect(fileContent).toContain('`<p>${')
      expect(fileContent).toContain('</p>`')
    })

    it('should use &nbsp; for empty lines', () => {
      expect(fileContent).toMatch(/applyPlainText[\s\S]*?&nbsp;/)
    })

    it('should parse HTML into view fragment via processor', () => {
      expect(fileContent).toContain('editor.data.processor.toView')
    })

    it('should convert view fragment to model fragment', () => {
      expect(fileContent).toContain('editor.data.toModel')
    })

    it('should use model.change for undoable batch', () => {
      expect(fileContent).toMatch(/applyPlainText[\s\S]*?editor\.model\.change/)
    })

    it('should clear root content before inserting', () => {
      expect(fileContent).toContain('writer.remove(writer.createRangeIn(root))')
    })

    it('should insert plain text model fragment at root', () => {
      expect(fileContent).toContain('writer.insert(modelFragment, root, 0)')
    })
  })

  describe('cancelPlainText', () => {
    it('should define cancelPlainText method', () => {
      expect(fileContent).toContain('cancelPlainText()')
    })

    it('should return early when not in plain text mode', () => {
      expect(fileContent).toMatch(
        /cancelPlainText[\s\S]*?if\s*\(\s*!this\._isPlainText\s*\)\s*return/
      )
    })

    it('should get undo command from editor', () => {
      expect(fileContent).toMatch(
        /cancelPlainText[\s\S]*?commands\.get\('undo'\)/
      )
    })

    it('should execute undo command when enabled', () => {
      expect(fileContent).toMatch(
        /cancelPlainText[\s\S]*?undoCommand\?\.isEnabled[\s\S]*?undoCommand\.execute\(\)/
      )
    })

    it('should not reset _isPlainText directly (delegates to undo listener)', () => {
      // State reset happens in the undo execute listener, not in cancelPlainText itself
      const cancelPlainTextBody = fileContent.slice(
        fileContent.indexOf('cancelPlainText()'),
        fileContent.indexOf('private _richTextCommands')
      )
      expect(cancelPlainTextBody).not.toContain('this._isPlainText = false')
    })
  })

  describe('init — plainTextMode button', () => {
    it('should register plainTextMode component via componentFactory', () => {
      expect(fileContent).toContain(
        "editor.ui.componentFactory.add('plainTextMode'"
      )
    })

    it('should create a ButtonView', () => {
      expect(fileContent).toContain('new ButtonView(locale)')
    })

    it('should set button label to Plain text', () => {
      expect(fileContent).toContain("label: 'Plain text'")
    })

    it('should make button toggleable', () => {
      expect(fileContent).toContain('isToggleable: true')
    })

    it('should enable tooltip on button', () => {
      expect(fileContent).toContain('tooltip: true')
    })

    it('should show text on button', () => {
      expect(fileContent).toContain('withText: true')
    })

    it('should toggle _isPlainText on button execute', () => {
      expect(fileContent).toContain('this._isPlainText = !this._isPlainText')
    })

    it('should call applyPlainText when switching to plain text', () => {
      expect(fileContent).toMatch(/button\.on\('execute'[\s\S]*?applyPlainText/)
    })

    it('should call _syncButton after toggling', () => {
      expect(fileContent).toMatch(/button\.on\('execute'[\s\S]*?_syncButton/)
    })

    it('should call _onToggle with new state', () => {
      expect(fileContent).toMatch(
        /button\.on\('execute'[\s\S]*?_onToggle\?\.\(this\._isPlainText\)/
      )
    })
  })

  describe('init — undo listener', () => {
    it('should get undo command in init', () => {
      expect(fileContent).toMatch(/init\(\)[\s\S]*?commands\.get\('undo'\)/)
    })

    it('should register execute listener on undo command', () => {
      expect(fileContent).toMatch(
        /undoCommand[\s\S]*?undoCommand\.on\('execute'/
      )
    })

    it('should reset _isPlainText to false on undo when active', () => {
      expect(fileContent).toMatch(
        /undoCommand\.on\('execute'[\s\S]*?this\._isPlainText = false/
      )
    })

    it('should call _syncButton on undo when active', () => {
      expect(fileContent).toMatch(
        /undoCommand\.on\('execute'[\s\S]*?_syncButton/
      )
    })

    it('should call _onToggle with false on undo when active', () => {
      expect(fileContent).toMatch(
        /undoCommand\.on\('execute'[\s\S]*?_onToggle\?\.\(false\)/
      )
    })

    it('should guard undo handler with _isPlainText check', () => {
      expect(fileContent).toMatch(
        /undoCommand\.on\('execute'[\s\S]*?if\s*\(\s*this\._isPlainText\s*\)/
      )
    })
  })

  describe('init — rich text commands auto-uncheck', () => {
    it('should define _richTextCommands list', () => {
      expect(fileContent).toContain('private _richTextCommands')
    })

    it('should include bold in rich text commands', () => {
      expect(fileContent).toContain("'bold'")
    })

    it('should include italic in rich text commands', () => {
      expect(fileContent).toContain("'italic'")
    })

    it('should include underline in rich text commands', () => {
      expect(fileContent).toContain("'underline'")
    })

    it('should include heading in rich text commands', () => {
      expect(fileContent).toContain("'heading'")
    })

    it('should include link in rich text commands', () => {
      expect(fileContent).toContain("'link'")
    })

    it('should iterate over _richTextCommands in init', () => {
      expect(fileContent).toContain('this._richTextCommands.forEach')
    })

    it('should register execute listener on each rich text command', () => {
      expect(fileContent).toMatch(/forEach[\s\S]*?command\.on\('execute'/)
    })

    it('should reset _isPlainText when a rich text command executes', () => {
      expect(fileContent).toMatch(
        /command\.on\('execute'[\s\S]*?this\._isPlainText = false/
      )
    })

    it('should call _onToggle with false when rich text command executes', () => {
      expect(fileContent).toMatch(
        /command\.on\('execute'[\s\S]*?_onToggle\?\.\(false\)/
      )
    })

    it('should guard rich text handler with _isPlainText check', () => {
      expect(fileContent).toMatch(
        /command\.on\('execute'[\s\S]*?if\s*\(\s*this\._isPlainText\s*\)/
      )
    })

    it('should skip commands that do not exist on the editor', () => {
      expect(fileContent).toContain('if (!command) return')
    })
  })
})
