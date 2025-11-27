'use client'

import AdminDomainFormFrame from '@/features/admin-panel/components/form/admin-panel-form'
import { useSaveCustomDomainConfigMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useDomainConfig } from '@/features/admin-panel/utils/use-domain-config'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export default function NewCustomDomainPage() {
  // read ?name=... from URL
  const search = useSearchParams()
  const rawName = search?.get('name') ?? ''
  // decode the name if needed
  const domainName = decodeURIComponent(rawName || '')

  const { tabNames, tabDataByTab, isLoading, isFormLoading } = useDomainConfig({
    customDomainId: undefined,
  })

  const [saveCustomDomainConfig, { isLoading: isSaving }] =
    useSaveCustomDomainConfigMutation()

  const router = useRouter()
  const pathname = usePathname() ?? '/'
  // extract locale
  const parts = pathname.split('/')
  const locale = parts[1] || ''

  // We will render the form prefilled with default settings (useDomainConfig handles that).
  // But we need to POST a full config when creating a new domain.
  // AdminDomainFormFrame will call onSubmit with the full values when we pass sendFullObjectOnSubmit = true.
  async function handleCreate(values: Record<string, unknown>) {
    if (!domainName) {
      alert('Missing domain name')
      return
    }
    try {
      // pass domain id alongside config if the API expects it in body
      // (saveCustomDomainConfig signature accepts { customDomainId, config } in the client code)
      await saveCustomDomainConfig({
        customDomainId: domainName.toLowerCase(),
        config: values,
      }).unwrap()

      // navigate to the newly created domain page
      const target = `/${locale}/admin_panel/domains/custom_domains/${encodeURIComponent(
        domainName.toLowerCase()
      )}`
      router.push(target)
    } catch (err: any) {
      const msg =
        err?.data?.message || err?.message || 'Failed to create domain'
      alert(msg)
    }
  }

  // If no name is provided, we still render the page but show header "New domain"
  const headerTitle = domainName || 'New domain'

  // DomainConfigFormPage expects onSubmit to be passed; but that component wraps AdminDomainFormFrame
  // and doesn't support the "send full object" option. For creation page we render AdminDomainFormFrame
  // directly so we can set sendFullObjectOnSubmit = true.
  const rawTabData =
    tabDataByTab && tabNames && tabNames.length
      ? (tabDataByTab as any)[tabNames[0]]
      : undefined
  const initialTabData =
    tabNames && tabNames.length ? { [tabNames[0]]: rawTabData ?? {} } : {}

  return (
    <div className="flex h-screen w-full flex-col">
      <div className="p-6">
        <h1 className="mb-4 text-2xl font-bold">{headerTitle}</h1>
        <p className="text-muted-foreground text-base">
          Configure the settings for the new custom domain.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-auto pr-6 pl-6">
        {/* Show tabs */}
        <div className="mb-2">
          {/* reuse AdminPanelTabs via DomainConfigFormPage logic would be fine,
              but to keep this file self-contained we simply list tabs above the form */}
        </div>

        <div className="flex min-h-0 pb-24">
          <AdminDomainFormFrame
            // pass the single active tab data (same shape DomainConfigFormPage uses)
            data={initialTabData}
            // request full values on submit (not only diffs)
            // AdminDomainFormFrame supports this optional prop (sendFullObjectOnSubmit)
            sendFullObjectOnSubmit={true}
            onSubmit={handleCreate}
            isLoading={isSaving || isFormLoading}
          />
        </div>
      </div>
    </div>
  )
}
