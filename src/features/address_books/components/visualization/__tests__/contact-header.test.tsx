import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

jest.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="avatar">{children}</div>
  ),
  AvatarImage: ({ src, alt }: { src?: string; alt?: string }) => (
    <img data-testid="avatar-image" src={src} alt={alt} />
  ),
  AvatarFallback: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="avatar-fallback">{children}</div>
  ),
}))

import { ContactHeader } from '../contact-header'

describe('ContactHeader', () => {
  describe('basic rendering', () => {
    it('renders the contact full name as the page heading', () => {
      render(
        <ContactHeader firstName="Brian" lastName="Topgoush" />
      )

      const heading = screen.getByRole('heading', { level: 1, name: 'Brian Topgoush' })
      expect(heading).toHaveAttribute('id', 'contact-name')
    })

    it('renders initials when no photo is provided', () => {
      render(
        <ContactHeader firstName="Brian" lastName="Topgoush" />
      )

      expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('BT')
      expect(screen.queryByTestId('avatar-image')).not.toBeInTheDocument()
    })

    it('renders the photo when provided', () => {
      render(
        <ContactHeader
          firstName="Brian"
          lastName="Topgoush"
          photo="https://example.com/photo.jpg"
        />
      )

      expect(screen.getByTestId('avatar-image')).toHaveAttribute(
        'src',
        'https://example.com/photo.jpg'
      )
      expect(screen.getByTestId('avatar-image')).toHaveAttribute('alt', 'Brian Topgoush')
    })
  })

  describe('configuration', () => {
    it('renders organization and job title as subtitle', () => {
      render(
        <ContactHeader
          firstName="Brian"
          lastName="Topgoush"
          organization="Creative Studio"
          jobTitle="UI/UX Designer"
        />
      )

      expect(
        screen.getByText('Creative Studio • UI/UX Designer')
      ).toBeInTheDocument()
    })

    it('omits subtitle when organization and job title are missing', () => {
      const { container } = render(
        <ContactHeader firstName="Brian" lastName="Topgoush" />
      )

      expect(container.querySelector('p')).not.toBeInTheDocument()
    })
  })
})
