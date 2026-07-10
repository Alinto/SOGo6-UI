import type { useProfile } from '@/features/user-profile'

export function resolveComposeAccountId(
  identityMail: string | undefined,
  mainAccount: ReturnType<typeof useProfile>['mainAccount'],
  externalAccounts: ReturnType<typeof useProfile>['externalAccounts']
): string {
  if (!identityMail) return '0'

  const inMain = mainAccount?.identities?.some((id) => id.mail === identityMail)
  if (inMain && mainAccount?.id) return String(mainAccount.id)

  for (const account of externalAccounts) {
    const inExternal = account.identities?.some(
      (id) => id.mail === identityMail
    )
    if (inExternal && account.id) return String(account.id)
  }

  return '0'
}
