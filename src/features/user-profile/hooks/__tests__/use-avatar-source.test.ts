import {
  PP_DEFAULT,
  PP_GRAVATAR,
  PP_LIBRAVATAR,
  PP_USERSOURCE,
} from '@/features/user-settings/store/user-preferences-api-types'
import { renderHook, waitFor } from '@testing-library/react'
import { useAvatarSource } from '../../hooks/use-avatar-source'

// Stable hash for "john@example.com" (trimmed + lowercased)
const JOHN_EMAIL = 'john@example.com'
const JOHN_HASH =
  '855f96e983f1f8e8be944692b6f719fd54329826cb62e98015efee8e2e071dd4'

describe('useAvatarSource', () => {
  describe('initial state', () => {
    it('returns fallback before the effect resolves', () => {
      const { result } = renderHook(() =>
        useAvatarSource({ pictureSource: PP_DEFAULT })
      )
      expect(result.current).toEqual({
        type: 'fallback',
        alt: 'profilePictureSource.useDefault',
      })
    })
  })

  describe('PP_DEFAULT', () => {
    it('returns fallback after resolving', async () => {
      const { result } = renderHook(() =>
        useAvatarSource({ pictureSource: PP_DEFAULT })
      )
      await waitFor(() => {
        expect(result.current).toEqual({
          type: 'fallback',
          alt: 'profilePictureSource.useDefault',
        })
      })
    })

    it('returns fallback even when email is provided', async () => {
      const { result } = renderHook(() =>
        useAvatarSource({ pictureSource: PP_DEFAULT, email: JOHN_EMAIL })
      )
      await waitFor(() => {
        expect(result.current).toEqual({
          type: 'fallback',
          alt: 'profilePictureSource.useDefault',
        })
      })
    })
  })

  describe('PP_GRAVATAR', () => {
    it('returns a gravatar image URL with the hashed email', async () => {
      const { result } = renderHook(() =>
        useAvatarSource({ pictureSource: PP_GRAVATAR, email: JOHN_EMAIL })
      )
      await waitFor(() => {
        expect(result.current).toEqual({
          type: 'image',
          src: `https://www.gravatar.com/avatar/${JOHN_HASH}?d=mp&s=200`,
          alt: 'profilePictureSource.useGravatar',
        })
      })
    })

    it('normalises email to lowercase before hashing', async () => {
      const { result: lower } = renderHook(() =>
        useAvatarSource({
          pictureSource: PP_GRAVATAR,
          email: 'john@example.com',
        })
      )
      const { result: upper } = renderHook(() =>
        useAvatarSource({
          pictureSource: PP_GRAVATAR,
          email: 'JOHN@EXAMPLE.COM',
        })
      )
      await waitFor(() => expect(lower.current.type).toBe('image'))
      await waitFor(() => expect(upper.current.type).toBe('image'))
      expect((lower.current as any).src).toBe((upper.current as any).src)
    })

    it('uses an empty hash when no email is provided', async () => {
      const { result } = renderHook(() =>
        useAvatarSource({ pictureSource: PP_GRAVATAR })
      )
      await waitFor(() => {
        expect(result.current).toMatchObject({
          type: 'image',
          alt: 'profilePictureSource.useGravatar',
        })
        // src should still be a valid gravatar URL
        expect((result.current as any).src).toMatch(
          /^https:\/\/www\.gravatar\.com\/avatar\//
        )
      })
    })
  })

  describe('PP_LIBRAVATAR', () => {
    it('returns a libravatar image URL with the hashed email', async () => {
      const { result } = renderHook(() =>
        useAvatarSource({ pictureSource: PP_LIBRAVATAR, email: JOHN_EMAIL })
      )
      await waitFor(() => {
        expect(result.current).toEqual({
          type: 'image',
          src: `https://seccdn.libravatar.org/avatar/${JOHN_HASH}?d=mp&s=200`,
          alt: 'profilePictureSource.useLibravatar',
        })
      })
    })
  })

  describe('PP_USERSOURCE', () => {
    it('returns the provided base64 string as src', async () => {
      const base64 = 'data:image/png;base64,abc123'
      const { result } = renderHook(() =>
        useAvatarSource({
          pictureSource: PP_USERSOURCE,
          userSourceBase64: base64,
        })
      )
      await waitFor(() => {
        expect(result.current).toEqual({
          type: 'image',
          src: base64,
          alt: 'profilePictureSource.useCustom',
        })
      })
    })

    it('returns an empty src when no base64 is provided', async () => {
      const { result } = renderHook(() =>
        useAvatarSource({ pictureSource: PP_USERSOURCE })
      )
      await waitFor(() => {
        expect(result.current).toEqual({
          type: 'image',
          src: '',
          alt: 'profilePictureSource.useCustom',
        })
      })
    })
  })

  describe('reactivity', () => {
    it('updates when pictureSource changes', async () => {
      const { result, rerender } = renderHook(
        ({ pictureSource }) =>
          useAvatarSource({ pictureSource, email: JOHN_EMAIL }),
        {
          initialProps: {
            pictureSource: PP_GRAVATAR as
              | typeof PP_GRAVATAR
              | typeof PP_DEFAULT,
          },
        }
      )
      await waitFor(() => expect(result.current.type).toBe('image'))

      rerender({ pictureSource: PP_DEFAULT })
      await waitFor(() => expect(result.current.type).toBe('fallback'))
    })

    it('updates when email changes', async () => {
      const { result, rerender } = renderHook(
        ({ email }) => useAvatarSource({ pictureSource: PP_GRAVATAR, email }),
        { initialProps: { email: 'john@example.com' } }
      )
      await waitFor(() => expect(result.current.type).toBe('image'))
      const firstSrc = (result.current as any).src

      rerender({ email: 'jane@example.com' })
      await waitFor(() => {
        expect((result.current as any).src).not.toBe(firstSrc)
      })
    })
  })
})
