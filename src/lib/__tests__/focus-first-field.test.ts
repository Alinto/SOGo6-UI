import { focusFirstField } from '../focus-first-field'

function dispatchOn(container: HTMLElement) {
  const event = new Event('focusScope.autoFocusOnMount', { cancelable: true })
  container.addEventListener('focusScope.autoFocusOnMount', focusFirstField)
  container.dispatchEvent(event)
  return event
}

function makeContainer(html: string) {
  const container = document.createElement('div')
  container.innerHTML = html
  document.body.appendChild(container)
  return container
}

describe('focusFirstField', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('focuses the first field and prevents the default focus', () => {
    const container = makeContainer(
      '<button>Cancel</button><input id="first" /><input id="second" />'
    )
    const event = dispatchOn(container)

    expect(event.defaultPrevented).toBe(true)
    expect(document.activeElement?.id).toBe('first')
  })

  it('skips hidden, disabled and readonly fields', () => {
    const container = makeContainer(
      [
        '<input type="hidden" />',
        '<input disabled />',
        '<input readonly />',
        '<div hidden><input /></div>',
        '<div aria-hidden="true"><textarea></textarea></div>',
        '<textarea id="target"></textarea>',
      ].join('')
    )
    dispatchOn(container)

    expect(document.activeElement?.id).toBe('target')
  })

  it('skips fields hidden by CSS or removed from the tab order', () => {
    const container = makeContainer(
      [
        '<input style="display: none" />',
        '<div style="display: none"><input /></div>',
        '<input style="visibility: hidden" />',
        '<input tabindex="-1" />',
        '<input id="target" />',
      ].join('')
    )
    dispatchOn(container)

    expect(document.activeElement?.id).toBe('target')
  })

  it('keeps the default behavior when every field is hidden', () => {
    const container = makeContainer(
      '<button>Cancel</button><input style="display: none" />'
    )
    const event = dispatchOn(container)

    expect(event.defaultPrevented).toBe(false)
  })

  it('keeps the default behavior when there is no field', () => {
    const container = makeContainer('<button>Cancel</button>')
    const event = dispatchOn(container)

    expect(event.defaultPrevented).toBe(false)
    expect(document.activeElement).toBe(document.body)
  })
})
