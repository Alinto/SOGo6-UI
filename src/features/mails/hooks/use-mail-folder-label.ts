'use client'

import { useAppSelector } from '@/lib/redux/hooks'
import { useTranslations } from 'next-intl'
import type { ImapFolderType, ImapMessagesList } from '../mails-types'
import { getFolderDisplayName } from '../utils/folder-path-from-params'

// Search results carry the mail's actual folder on `data.folder` (see
// ImapMessagesList) — always surface it as a label while a search is
// active, even when the search was scoped to a single folder, so results
// consistently show where each mail lives.
export function useMailFolderLabel(
  data: ImapMessagesList,
  folderPath: string,
  folderType?: ImapFolderType
): string | undefined {
  const tCommons = useTranslations('MAILS_COMMONS')
  const mailSearch = useAppSelector((state) => state.mailSearch)

  if (!mailSearch.isActive || !data.folder) return undefined
  return getFolderDisplayName(folderPath, tCommons, folderType)
}
