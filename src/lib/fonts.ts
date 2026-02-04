import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import localFont from 'next/font/local'

export const geistSans = GeistSans
export const geistMono = GeistMono

export const openDyslexic = localFont({
  src: [
    {
      path: '../assets/fonts/OpenDyslexic-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../assets/fonts/OpenDyslexic-Italic.otf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../assets/fonts/OpenDyslexic-Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../assets/fonts/OpenDyslexic-Bold-Italic.otf',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-opendyslexic',
  display: 'swap',
  fallback: ['var(--font-geist-sans)', 'sans-serif'],
})
