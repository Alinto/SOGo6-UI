import { render, screen } from '@testing-library/react'
import { Avatar, AvatarFallback, AvatarImage } from '../avatar'

describe('Avatar components', () => {
  describe('Avatar component', () => {
    it('renders with default props', () => {
      render(<Avatar data-testid="avatar" />)
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toBeInTheDocument()
      expect(avatar).toHaveClass(
        'relative',
        'flex',
        'h-10',
        'w-10',
        'shrink-0',
        'overflow-hidden',
        'rounded-full'
      )
    })

    it('applies custom className', () => {
      render(<Avatar className="custom-class" data-testid="avatar" />)
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveClass('custom-class')
      // Should still have default classes
      expect(avatar).toHaveClass(
        'relative',
        'flex',
        'h-10',
        'w-10',
        'shrink-0',
        'overflow-hidden',
        'rounded-full'
      )
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(<Avatar ref={ref} data-testid="avatar" />)
      expect(ref).toHaveBeenCalled()
    })

    it('passes through additional props', () => {
      render(<Avatar id="test-avatar" role="img" data-testid="avatar" />)
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveAttribute('id', 'test-avatar')
      expect(avatar).toHaveAttribute('role', 'img')
    })

    it('matches snapshot', () => {
      const { asFragment } = render(<Avatar />)
      expect(asFragment()).toMatchSnapshot()
    })
  })

  describe('AvatarFallback component', () => {
    it('renders with default props', () => {
      render(
        <Avatar>
          <AvatarFallback data-testid="avatar-fallback">JD</AvatarFallback>
        </Avatar>
      )
      const avatarFallback = screen.getByTestId('avatar-fallback')
      expect(avatarFallback).toBeInTheDocument()
      expect(avatarFallback).toHaveClass(
        'bg-muted',
        'flex',
        'h-full',
        'w-full',
        'items-center',
        'justify-center',
        'rounded-full'
      )
      expect(avatarFallback).toHaveTextContent('JD')
    })

    it('applies custom className', () => {
      render(
        <Avatar>
          <AvatarFallback
            className="custom-fallback-class"
            data-testid="avatar-fallback"
          >
            JD
          </AvatarFallback>
        </Avatar>
      )
      const avatarFallback = screen.getByTestId('avatar-fallback')
      expect(avatarFallback).toHaveClass('custom-fallback-class')
      // Should still have default classes
      expect(avatarFallback).toHaveClass(
        'bg-muted',
        'flex',
        'h-full',
        'w-full',
        'items-center',
        'justify-center',
        'rounded-full'
      )
    })

    it('renders with text content', () => {
      render(
        <Avatar>
          <AvatarFallback data-testid="avatar-fallback">
            John Doe
          </AvatarFallback>
        </Avatar>
      )
      const avatarFallback = screen.getByTestId('avatar-fallback')
      expect(avatarFallback).toHaveTextContent('John Doe')
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(
        <Avatar>
          <AvatarFallback ref={ref} data-testid="avatar-fallback">
            JD
          </AvatarFallback>
        </Avatar>
      )
      expect(ref).toHaveBeenCalled()
    })

    it('passes through additional props', () => {
      render(
        <Avatar>
          <AvatarFallback
            id="test-fallback"
            title="Fallback Avatar"
            data-testid="avatar-fallback"
          >
            JD
          </AvatarFallback>
        </Avatar>
      )
      const avatarFallback = screen.getByTestId('avatar-fallback')
      expect(avatarFallback).toHaveAttribute('id', 'test-fallback')
      expect(avatarFallback).toHaveAttribute('title', 'Fallback Avatar')
    })

    it('matches snapshot', () => {
      const { asFragment } = render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      )
      expect(asFragment()).toMatchSnapshot()
    })
  })

  describe('Complete Avatar integration', () => {
    it('renders avatar with only fallback when no image provided', () => {
      render(
        <Avatar data-testid="avatar-only-fallback">
          <AvatarFallback data-testid="fallback-only">UA</AvatarFallback>
        </Avatar>
      )

      const avatar = screen.getByTestId('avatar-only-fallback')
      const fallback = screen.getByTestId('fallback-only')

      expect(avatar).toBeInTheDocument()
      expect(fallback).toBeInTheDocument()
      expect(fallback).toHaveTextContent('UA')
    })

    it('renders complete avatar structure with proper component nesting', () => {
      render(
        <Avatar data-testid="complete-avatar">
          <AvatarImage src="/user-avatar.jpg" alt="User Avatar" />
          <AvatarFallback data-testid="complete-avatar-fallback">
            UA
          </AvatarFallback>
        </Avatar>
      )

      const avatar = screen.getByTestId('complete-avatar')
      const fallback = screen.getByTestId('complete-avatar-fallback')

      expect(avatar).toBeInTheDocument()
      expect(fallback).toBeInTheDocument()
      expect(fallback).toHaveTextContent('UA')
    })

    it('matches snapshot for complete avatar', () => {
      const { asFragment } = render(
        <Avatar>
          <AvatarImage src="/complete-avatar.jpg" alt="Complete Avatar" />
          <AvatarFallback>CA</AvatarFallback>
        </Avatar>
      )
      expect(asFragment()).toMatchSnapshot()
    })
  })

  describe('Accessibility', () => {
    it('supports accessible fallback with meaningful text', () => {
      render(
        <Avatar>
          <AvatarFallback data-testid="accessible-fallback">JD</AvatarFallback>
        </Avatar>
      )

      const fallback = screen.getByTestId('accessible-fallback')
      expect(fallback).toHaveTextContent('JD')
    })

    it('supports role attribute for semantic meaning', () => {
      render(
        <Avatar
          role="img"
          aria-label="User avatar"
          data-testid="accessible-avatar"
        >
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      )

      const avatar = screen.getByTestId('accessible-avatar')
      expect(avatar).toHaveAttribute('role', 'img')
      expect(avatar).toHaveAttribute('aria-label', 'User avatar')
    })

    it('can include image component for accessibility', () => {
      render(
        <Avatar>
          <AvatarImage src="/profile.jpg" alt="John Doe profile picture" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      )

      // When image fails to load, fallback is visible
      const fallback = screen.getByText('JD')
      expect(fallback).toBeInTheDocument()
    })
  })
})
