'use client'

import DomainConfigFormPage from '@/features/admin-panel/components/form/admin-panel-domain-config-form'
import { useDomainConfig } from '@/features/admin-panel/utils/use-domain-config'
import { useParams, useRouter } from 'next/navigation'
import { useCallback } from 'react'

export default function NewCustomDomainPage() {
  const params = useParams()
  const router = useRouter()
  const customDomainId = (params as any)?.custom_domain_id as string

  // Use the hook in "isNew" mode so the form is prefilled from defaults and submission will POST
  const { tabNames, tabDataByTab, isLoading, isFormLoading, handleSubmit } =
    useDomainConfig({ customDomainId, isNew: true })

  // After successful POST (create), redirect to the normal domain page
  const onSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      const res = await handleSubmit(values)
      // If success, navigate to the regular custom domain page
      const target =
        `/` +
        (typeof window !== 'undefined'
          ? window.location.pathname.split('/')[1]
          : '') +
        `/admin_panel/domains/custom_domains/${encodeURIComponent(customDomainId?.toLowerCase() ?? '')}`
      // Prefer using next/navigation router
      router.push(
        `/${typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : ''}/admin_panel/domains/custom_domains/${encodeURIComponent(
          customDomainId?.toLowerCase() ?? ''
        )}`
      )
      return res
    },
    [customDomainId, handleSubmit, router]
  )

  return (
    <DomainConfigFormPage
      domainName={customDomainId}
      tabNames={tabNames}
      tabDataByTab={tabDataByTab}
      onSubmit={onSubmit}
      isLoading={isLoading}
      isFormLoading={isFormLoading}
    />
  )
}
