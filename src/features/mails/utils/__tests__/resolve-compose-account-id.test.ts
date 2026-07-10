import { resolveComposeAccountId } from '../resolve-compose-account-id'

describe('resolveComposeAccountId', () => {
  const mainAccount = {
    id: '0',
    identities: [{ mail: 'main@sogo.nu' }, { mail: 'alias@sogo.nu' }],
  } as any

  const externalAccounts = [
    { id: 'ext-1', identities: [{ mail: 'ext1@sogo.nu' }] },
    { id: 'ext-2', identities: [{ mail: 'ext2@sogo.nu' }] },
  ] as any

  it('returns "0" when identityMail is undefined', () => {
    expect(resolveComposeAccountId(undefined, mainAccount, [])).toBe('0')
  })

  it('returns "0" when identityMail is an empty string', () => {
    expect(resolveComposeAccountId('', mainAccount, [])).toBe('0')
  })

  it('returns the main account id when the identity belongs to the main account', () => {
    expect(
      resolveComposeAccountId('main@sogo.nu', mainAccount, externalAccounts)
    ).toBe('0')
  })

  it('matches any identity of the main account, not just the first one', () => {
    expect(
      resolveComposeAccountId('alias@sogo.nu', mainAccount, externalAccounts)
    ).toBe('0')
  })

  it('returns the matching external account id when identity belongs to it', () => {
    expect(
      resolveComposeAccountId('ext1@sogo.nu', mainAccount, externalAccounts)
    ).toBe('ext-1')
  })

  it('checks external accounts in order and returns the first match', () => {
    expect(
      resolveComposeAccountId('ext2@sogo.nu', mainAccount, externalAccounts)
    ).toBe('ext-2')
  })

  it('returns "0" when no account matches the identity', () => {
    expect(
      resolveComposeAccountId(
        'unknown@sogo.nu',
        mainAccount,
        externalAccounts
      )
    ).toBe('0')
  })

  it('does not throw when mainAccount is undefined and falls back to external accounts', () => {
    expect(
      resolveComposeAccountId('ext1@sogo.nu', undefined, externalAccounts)
    ).toBe('ext-1')
  })

  it('returns "0" when mainAccount is undefined and no external account matches', () => {
    expect(
      resolveComposeAccountId('unknown@sogo.nu', undefined, externalAccounts)
    ).toBe('0')
  })

  it('returns "0" when externalAccounts is empty and mainAccount does not match', () => {
    expect(
      resolveComposeAccountId('unknown@sogo.nu', mainAccount, [])
    ).toBe('0')
  })
})
