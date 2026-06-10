import { render, screen } from '@testing-library/react'
import {
  PP_DEFAULT,
  PP_GRAVATAR,
  PP_USERSOURCE,
} from '../../../user-settings/store/user-preferences-api-types'
import { ProfileAvatar } from '../profile-avatar'
import { useAvatarSource } from '../../hooks/use-avatar-source'

// Mock the hook so we control what avatar source is returned
jest.mock('../../hooks/use-avatar-source')
const mockUseAvatarSource = useAvatarSource as jest.MockedFunction<
  typeof useAvatarSource
>

jest.mock('@/components/ui/avatar', () => ({
  Avatar: ({ className, children }: React.HTMLAttributes<HTMLSpanElement>) => (
    <span className={className}>{children}</span>
  ),
  AvatarImage: ({ src, alt }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img src={src} alt={alt} />
  ),
  AvatarFallback: ({
    className,
    children,
  }: React.HTMLAttributes<HTMLSpanElement>) => (
    <span className={className}>{children}</span>
  ),
}))

describe('ProfileAvatar', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('when avatarSource is an image', () => {
    beforeEach(() => {
      mockUseAvatarSource.mockReturnValue({
        type: 'image',
        src: 'https://www.gravatar.com/avatar/abc123?d=mp&s=200',
        alt: 'Gravatar',
      })
    })

    it('renders an img element with the correct src and alt', () => {
      render(
        <ProfileAvatar pictureSource={PP_GRAVATAR} email="john@example.com" />
      )
      const img = screen.getByRole('img')
      expect(img).toHaveAttribute(
        'src',
        'https://www.gravatar.com/avatar/abc123?d=mp&s=200'
      )
      expect(img).toHaveAttribute('alt', 'Gravatar')
    })

    it('passes pictureSource and email to useAvatarSource', () => {
      render(
        <ProfileAvatar pictureSource={PP_GRAVATAR} email="john@example.com" />
      )
      expect(mockUseAvatarSource).toHaveBeenCalledWith({
        pictureSource: PP_GRAVATAR,
        email: 'john@example.com',
        userSourceBase64: undefined,
      })
    })

    it('passes userSourceBase64 to useAvatarSource when provided', () => {
      render(
        <ProfileAvatar
          pictureSource={PP_USERSOURCE}
          userSourceBase64="data:image/png;base64,abc"
        />
      )
      expect(mockUseAvatarSource).toHaveBeenCalledWith({
        pictureSource: PP_USERSOURCE,
        email: undefined,
        userSourceBase64: 'data:image/png;base64,abc',
      })
    })
  })

  describe('when avatarSource is a fallback', () => {
    beforeEach(() => {
      mockUseAvatarSource.mockReturnValue({
        type: 'fallback',
        alt: 'Default Avatar',
      })
    })

    it('does not render a placeholder img in fallback mode (initials only)', () => {
      render(<ProfileAvatar pictureSource={PP_DEFAULT} />)
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })

    it('renders fallbackUsername in AvatarFallback by default', () => {
      render(
        <ProfileAvatar pictureSource={PP_DEFAULT} fallbackUsername="John Doe" />
      )
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('renders initials when useInitialsFallback is true', () => {
      render(
        <ProfileAvatar
          pictureSource={PP_DEFAULT}
          fallbackUsername="John Doe"
          useInitialsFallback
        />
      )
      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('renders "U" as fallback when no fallbackUsername is provided', () => {
      render(<ProfileAvatar pictureSource={PP_DEFAULT} />)
      expect(screen.getByText('U')).toBeInTheDocument()
    })

    it('renders single initial for a single-word username', () => {
      render(
        <ProfileAvatar
          pictureSource={PP_DEFAULT}
          fallbackUsername="John"
          useInitialsFallback
        />
      )
      expect(screen.getByText('J')).toBeInTheDocument()
    })
  })

  describe('size prop', () => {
    beforeEach(() => {
      mockUseAvatarSource.mockReturnValue({
        type: 'fallback',
        alt: 'Default Avatar',
      })
    })

    it('applies sm size classes', () => {
      const { container } = render(
        <ProfileAvatar pictureSource={PP_DEFAULT} size="sm" />
      )
      expect(container.firstChild).toHaveClass('h-10', 'w-10')
    })

    it('applies md size classes by default', () => {
      const { container } = render(<ProfileAvatar pictureSource={PP_DEFAULT} />)
      expect(container.firstChild).toHaveClass('h-20', 'w-20')
    })

    it('applies lg size classes', () => {
      const { container } = render(
        <ProfileAvatar pictureSource={PP_DEFAULT} size="lg" />
      )
      expect(container.firstChild).toHaveClass('h-32', 'w-32')
    })
  })

  describe('className prop', () => {
    beforeEach(() => {
      mockUseAvatarSource.mockReturnValue({
        type: 'fallback',
        alt: 'Default Avatar',
      })
    })

    it('applies additional className when provided', () => {
      const { container } = render(
        <ProfileAvatar pictureSource={PP_DEFAULT} className="custom-class" />
      )
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('displayName', () => {
    it('has correct displayName', () => {
      expect(ProfileAvatar.displayName).toBe('ProfileAvatar')
    })
  })
})
