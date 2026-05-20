// plain-text-mode-plugin.ts — full file
import { ButtonView, Plugin } from 'ckeditor5'

export class PlainTextModePlugin extends Plugin {
  static get pluginName() {
    return 'PlainTextModePlugin'
  }

  private _isPlainText: boolean = false
  private _buttonView: ButtonView | null = null
  private _onToggle: ((isPlainText: boolean) => void) | null = null
  private _setApplyingFlag: ((value: boolean) => void) | null = null

  get isPlainText(): boolean {
    return this._isPlainText
  }

  setApplyingFlagCallback(cb: (value: boolean) => void) {
    this._setApplyingFlag = cb
  }

  setInitialState(isPlainText: boolean) {
    this._isPlainText = isPlainText
    this._syncButton()
  }

  setOnToggle(cb: (isPlainText: boolean) => void) {
    this._onToggle = cb
  }

  private _syncButton() {
    if (this._buttonView) {
      this._buttonView.isOn = this._isPlainText
    }
  }

  stripHtml(html: string): string {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }

  applyPlainText() {
    const editor = this.editor

    const fullHtml = editor.getData()
    const plain = this.stripHtml(fullHtml)
    const bodyHtml = plain
      .split('\n')
      .map((line) => `<p>${line.length > 0 ? line : '&nbsp;'}</p>`)
      .join('')

    const viewFragment = editor.data.processor.toView(bodyHtml)
    const modelFragment = editor.data.toModel(viewFragment)

    // Undoable batch 
    editor.model.change((writer) => {
      const root = editor.model.document.getRoot()!
      writer.remove(writer.createRangeIn(root))
      writer.insert(modelFragment, root, 0)
    })
  }

  // Called by the "go back" button in the UI
  cancelPlainText() {
    if (!this._isPlainText) return
    const undoCommand = this.editor.commands.get('undo')
    if (undoCommand?.isEnabled) {
      // _isPlainText reset happens in the undo execute listener below
      undoCommand.execute()
    }
  }

  private _richTextCommands = [
    'bold',
    'italic',
    'underline',
    'strikethrough',
    'code',
    'subscript',
    'superscript',
    'removeFormat',
    'fontColor',
    'fontBackgroundColor',
    'fontFamily',
    'fontSize',
    'highlight',
    'alignment',
    'bulletedList',
    'numberedList',
    'indent',
    'outdent',
    'blockQuote',
    'insertTable',
    'mediaEmbed',
    'imageUpload',
    'link',
    'horizontalLine',
    'heading',
    'codeBlock',
  ]

  init() {
    const editor = this.editor

    editor.ui.componentFactory.add('plainTextMode', (locale) => {
      const button = new ButtonView(locale)
      this._buttonView = button

      button.set({
        label: 'Plain text',
        tooltip: true,
        withText: true,
        isToggleable: true,
        isOn: this._isPlainText,
      })

      button.on('execute', () => {
        this._isPlainText = !this._isPlainText
        if (this._isPlainText) {
          this.applyPlainText()
        }
        this._syncButton()
        this._onToggle?.(this._isPlainText)
      })

      return button
    })

    // ── Single undo listener registered once at init ──────────────────────
    // Resets plain text state whenever undo fires while mode is active.
    // This covers both cancelPlainText() and the user pressing the undo button.
    const undoCommand = editor.commands.get('undo')
    if (undoCommand) {
      undoCommand.on('execute', () => {
        if (this._isPlainText) {
          this._isPlainText = false
          this._syncButton()
          this._onToggle?.(false)
        }
      })
    }

    // Auto-uncheck when any rich-text command executes
    this._richTextCommands.forEach((commandName) => {
      const command = editor.commands.get(commandName)
      if (!command) return
      command.on('execute', () => {
        if (this._isPlainText) {
          this._isPlainText = false
          this._syncButton()
          this._onToggle?.(false)
        }
      })
    })
  }
}
