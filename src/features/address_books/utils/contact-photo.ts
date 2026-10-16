import type { VCard } from '../address-books-types'

export function getContactPhotoSrc(data: VCard): string | undefined {
  const candidates = [data.photo, ...(data.photos ?? [])].filter(
    Boolean
  ) as string[]
  return candidates.find(
    (src) =>
      src.startsWith('data:') ||
      src.startsWith('blob:') ||
      src.startsWith('http://') ||
      src.startsWith('https://')
  )
}
