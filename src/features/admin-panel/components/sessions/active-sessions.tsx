'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  useGetActiveSessionsQuery,
  useRevokeInactiveSessionsMutation,
  useRevokeSessionsMutation,
} from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

function formatActivity(value: string) {
  const seconds = Number(value)
  if (!Number.isFinite(seconds)) return value
  return new Date(seconds * 1000).toLocaleString()
}

export function ActiveSessions() {
  const t = useTranslations('AP_SESSIONS')
  const {
    data: sessions = [],
    isLoading,
    isError,
  } = useGetActiveSessionsQuery()
  const [revokeSessions, { isLoading: isRevoking }] =
    useRevokeSessionsMutation()
  const [revokeInactive, { isLoading: isRevokingInactive }] =
    useRevokeInactiveSessionsMutation()
  const [since, setSince] = useState('')
  const [error, setError] = useState(false)
  const busy = isRevoking || isRevokingInactive

  const handleRevoke = async (sessionKey: string) => {
    setError(false)
    try {
      await revokeSessions({ redis_key: [sessionKey] }).unwrap()
    } catch {
      setError(true)
    }
  }

  const handleRevokeInactive = async () => {
    const timestamp = Math.floor(new Date(since).getTime() / 1000)
    if (!Number.isFinite(timestamp)) return
    setError(false)
    try {
      await revokeInactive({ timestamp }).unwrap()
    } catch {
      setError(true)
    }
  }

  return (
    <section className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="text-lg font-semibold">{t('title.string')}</h1>
        <p className="text-muted-foreground text-sm">
          {t('description.string')}
        </p>
      </div>
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          void handleRevokeInactive()
        }}
      >
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('inactive.label.string')}</span>
          <Input
            type="datetime-local"
            value={since}
            aria-label={t('inactive.label.string')}
            onChange={(event) => setSince(event.target.value)}
          />
        </label>
        <Button type="submit" disabled={busy || !since}>
          {t('inactive.submit.string')}
        </Button>
      </form>
      {(error || isError) && (
        <p className="text-destructive text-sm">{t('error.string')}</p>
      )}
      {isLoading ? (
        <p className="text-muted-foreground text-sm">{t('loading.string')}</p>
      ) : sessions.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t('empty.string')}</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-3">{t('columns.uid.string')}</th>
              <th className="py-2 pr-3">{t('columns.domain.string')}</th>
              <th className="py-2 pr-3">{t('columns.last_activity.string')}</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.session_key} className="border-b">
                <td className="py-2 pr-3">{session.uid}</td>
                <td className="py-2 pr-3">{session.domain}</td>
                <td className="py-2 pr-3">
                  {formatActivity(session.last_activity)}
                </td>
                <td className="py-2 text-right">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => void handleRevoke(session.session_key)}
                  >
                    {t('revoke.string')}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
