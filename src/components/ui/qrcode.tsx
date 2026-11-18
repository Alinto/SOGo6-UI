import { useQRCode } from 'next-qrcode'

export function QRCode({ text }: { text: string }) {
  const { Canvas } = useQRCode()

  return (
    <Canvas
      text={text}
      options={{
        errorCorrectionLevel: 'M',
        margin: 3,
        scale: 4,
        width: 200,
        color: {
          // Plain black on white: some authenticator apps fail on colored QR codes
          dark: '#000000FF',
          light: '#FFFFFFFF',
        },
      }}
    />
  )
}

export default QRCode
