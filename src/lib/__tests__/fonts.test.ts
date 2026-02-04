// Mock next/font/local
jest.mock('next/font/local', () => {
  return jest.fn((config) => ({
    className: 'mock-local-font',
    variable: config?.variable || '--font-mock',
    style: { fontFamily: 'mock-font' },
    display: config?.display || 'swap',
    fallback: config?.fallback || ['sans-serif'],
  }))
})

// Mock geist/font/sans
jest.mock('geist/font/sans', () => ({
  GeistSans: {
    className: 'geist-sans',
    variable: '--font-geist-sans',
    style: { fontFamily: 'Geist Sans' },
  },
}))

// Mock geist/font/mono
jest.mock('geist/font/mono', () => ({
  GeistMono: {
    className: 'geist-mono',
    variable: '--font-geist-mono',
    style: { fontFamily: 'Geist Mono' },
  },
}))

import { geistSans, geistMono, openDyslexic } from '../fonts'

describe('fonts', () => {
  describe('geistSans', () => {
    it('should export geistSans', () => {
      expect(geistSans).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof geistSans).toBe('object')
      expect(geistSans).not.toBeNull()
    })

    it('should have className property', () => {
      expect(geistSans).toHaveProperty('className')
    })

    it('should have variable property', () => {
      expect(geistSans).toHaveProperty('variable')
    })

    it('should have style property', () => {
      expect(geistSans).toHaveProperty('style')
    })
  })

  describe('geistMono', () => {
    it('should export geistMono', () => {
      expect(geistMono).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof geistMono).toBe('object')
      expect(geistMono).not.toBeNull()
    })

    it('should have className property', () => {
      expect(geistMono).toHaveProperty('className')
    })

    it('should have variable property', () => {
      expect(geistMono).toHaveProperty('variable')
    })

    it('should have style property', () => {
      expect(geistMono).toHaveProperty('style')
    })
  })

  describe('openDyslexic', () => {
    it('should export openDyslexic', () => {
      expect(openDyslexic).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof openDyslexic).toBe('object')
      expect(openDyslexic).not.toBeNull()
    })

    it('should have className property', () => {
      expect(openDyslexic).toHaveProperty('className')
    })

    it('should have variable property set to --font-opendyslexic', () => {
      expect(openDyslexic).toHaveProperty('variable')
      expect(openDyslexic.variable).toBe('--font-opendyslexic')
    })

    it('should have display property set to swap', () => {
      expect(openDyslexic).toHaveProperty('display')
      expect((openDyslexic as { display?: string }).display).toBe('swap')
    })

    it('should have fallback property', () => {
      expect(openDyslexic).toHaveProperty('fallback')
      const fallback = (openDyslexic as { fallback?: string[] }).fallback
      expect(Array.isArray(fallback)).toBe(true)
    })

    it('should have fallback with correct values', () => {
      const fallback = (openDyslexic as { fallback?: string[] }).fallback
      expect(fallback).toBeDefined()
      if (fallback) {
        expect(fallback).toContain('var(--font-geist-sans)')
        expect(fallback).toContain('sans-serif')
      }
    })

    it('should have style property', () => {
      expect(openDyslexic).toHaveProperty('style')
    })
  })

  describe('font exports consistency', () => {
    it('should export all three fonts', () => {
      expect(geistSans).toBeDefined()
      expect(geistMono).toBeDefined()
      expect(openDyslexic).toBeDefined()
    })

    it('should have consistent structure across all fonts', () => {
      const commonProperties = ['className', 'variable', 'style']
      commonProperties.forEach((prop) => {
        expect(geistSans).toHaveProperty(prop)
        expect(geistMono).toHaveProperty(prop)
        expect(openDyslexic).toHaveProperty(prop)
      })
    })

    it('should have className as string for all fonts', () => {
      expect(typeof geistSans.className).toBe('string')
      expect(typeof geistMono.className).toBe('string')
      expect(typeof openDyslexic.className).toBe('string')
    })

    it('should have variable as string for all fonts', () => {
      expect(typeof geistSans.variable).toBe('string')
      expect(typeof geistMono.variable).toBe('string')
      expect(typeof openDyslexic.variable).toBe('string')
    })
  })
})
