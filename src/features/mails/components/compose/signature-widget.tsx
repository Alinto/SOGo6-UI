// signature-widget.ts — add non-selectable styles to the widget

import { Command, Plugin, toWidget, ViewDowncastWriter } from 'ckeditor5'
class SetSignatureCommand extends Command {
  execute({
    key,
    content,
    identitySignatures,
  }: {
    key: string
    content: string | null
    identitySignatures: string
  }) {
    this.editor.model.change((writer) => {
      const root = this.editor.model.document.getRoot()
      if (!root) return

      const existing = Array.from(root.getChildren()).find((n) =>
        n.is('element', 'signature')
      )

      if (key === 'none') {
        if (existing) writer.remove(existing)
        return
      }

      if (existing) {
        writer.setAttribute('data-content', content ?? '', existing)
        writer.setAttribute('data-selected-key', key, existing)
        writer.setAttribute('data-signatures', identitySignatures, existing)
      } else {
        const el = writer.createElement('signature', {
          'data-content': content ?? '',
          'data-selected-key': key,
          'data-signatures': identitySignatures,
        })
        this.editor.model.insertContent(el)
      }
    })
  }

  refresh() {
    this.isEnabled = true
  }
}

export class SignatureWidget extends Plugin {
  static get pluginName() {
    return 'SignatureWidget'
  }

  init() {
    const editor = this.editor
    const schema = editor.model.schema
    const conversion = editor.conversion

    schema.register('signature', {
      isObject: true,
      isBlock: true,
      allowWhere: '$block',
      allowAttributes: ['data-content', 'data-signatures', 'data-selected-key'],
    })

    const renderSection = (content: string, writer: ViewDowncastWriter) => {
      const section = writer.createContainerElement('section', {
        class: 'signature-widget',
        'data-widget': 'signature',
        'data-content': content,
        //  Prevent text cursor and text selection on the whole widget
        style: 'user-select: none; cursor: default;',
      })

      const separator = writer.createEmptyElement('hr', {
        class: 'signature-widget__separator',
        style: 'border:none;border-top:1px solid #e0e0e0;margin:4px 0;',
      })
      writer.insert(writer.createPositionAt(section, 0), separator)

      const contentWrapper = writer.createRawElement(
        'div',
        {
          class: 'signature-widget__content',
          //  Also on the inner content so inherited pointer-events don't leak
          style: 'pointer-events: none; user-select: none;',
        },
        (domElement: HTMLElement) => {
          domElement.innerHTML = content
        }
      )
      writer.insert(writer.createPositionAt(section, 'end'), contentWrapper)

      return section
    }

    // Editing downcast
    conversion.for('editingDowncast').elementToStructure({
      model: {
        name: 'signature',
        attributes: ['data-content', 'data-signatures', 'data-selected-key'],
      },
      view: (modelElement, conversionApi) => {
        const { writer } = conversionApi
        const content =
          (modelElement.getAttribute('data-content') as string) || ''
        const section = renderSection(content, writer)
        return toWidget(section, writer, {
          label: 'Signature',
          hasSelectionHandle: true,
        })
      },
    })

    // Data downcast
    conversion.for('dataDowncast').elementToStructure({
      model: {
        name: 'signature',
        attributes: ['data-content', 'data-signatures', 'data-selected-key'],
      },
      view: (modelElement, { writer }) => {
        const content =
          (modelElement.getAttribute('data-content') as string) || ''
        return renderSection(content, writer)
      },
    })

    // Upcast
    conversion.for('upcast').elementToElement({
      view: { name: 'section', classes: 'signature-widget' },
      model: (viewElement, { writer }) => {
        const content = viewElement.getAttribute('data-content') || ''
        const signaturesJson =
          viewElement.getAttribute('data-signatures') || '{}'
        const selectedKey = viewElement.getAttribute('data-selected-key') || ''
        return writer.createElement('signature', {
          'data-content': content,
          'data-signatures': signaturesJson,
          'data-selected-key': selectedKey,
        })
      },
    })

    editor.commands.add('setSignature', new SetSignatureCommand(editor))
  }
}
