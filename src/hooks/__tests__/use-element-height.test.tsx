import { render, screen } from '@testing-library/react'
import { useElementHeight } from '../use-element-height'

function Probe() {
  const { ref, height } = useElementHeight<HTMLDivElement>()
  return (
    <div ref={ref} data-testid="probe">
      {String(height)}
    </div>
  )
}

describe('useElementHeight', () => {
  it('is null while the element has no layout', () => {
    render(<Probe />)
    expect(screen.getByTestId('probe')).toHaveTextContent('null')
  })

  it('returns the element height once laid out', () => {
    const spy = jest
      .spyOn(HTMLElement.prototype, 'clientHeight', 'get')
      .mockReturnValue(320)
    render(<Probe />)
    expect(screen.getByTestId('probe')).toHaveTextContent('320')
    spy.mockRestore()
  })
})
