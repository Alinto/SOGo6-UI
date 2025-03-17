import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import QRCode from '../qrcode'

// filepath: src/components/ui/qrcode.test.tsx

jest.mock('next-qrcode', () => ({
  useQRCode: () => ({
    Canvas: ({ text, options }) => (
      <div
        data-testid="qrcode-canvas"
        data-text={text}
        data-options={JSON.stringify(options)}
      />
    ),
  }),
}))

describe('QRCode', () => {
  it('renders the QRCode component with the correct text and options', () => {
    const text = 'https://example.com'
    const { getByTestId } = render(<QRCode text={text} />)
    const canvas = getByTestId('qrcode-canvas')

    expect(canvas).toBeInTheDocument()
    expect(canvas).toHaveAttribute('data-text', text)
    expect(canvas).toHaveAttribute(
      'data-options',
      JSON.stringify({
        errorCorrectionLevel: 'M',
        margin: 3,
        scale: 4,
        width: 200,
        color: {
          dark: '#010599FF',
          light: '#FFBF60FF',
        },
      })
    )
    expect(canvas).toMatchSnapshot()
  })
})
