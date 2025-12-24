import { headers } from 'next/headers'

export async function getThemesServer(): Promise<string | null> {
  try {
    const headersList = await headers()
    const host = headersList.get('host') || 'localhost:3000'
    // Use X-Forwarded-Proto from reverse proxy, fallback to NODE_ENV check
    const protocol =
      headersList.get('x-forwarded-proto') ||
      (process.env.NODE_ENV === 'production' ? 'https' : 'http')

    const response = await fetch(
      `${protocol}://${host}/fakeApi/customization/themes`,
      {
        cache: 'force-cache', // Cache the themes data
      }
    )

    if (!response.ok) {
      console.error('Failed to fetch themes:', response.statusText)
      return null
    }

    const themes = await response.json()
    return themes
  } catch (error) {
    console.error('Error fetching themes on server:', error)
    return null
  }
}
