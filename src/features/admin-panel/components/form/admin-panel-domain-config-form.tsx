'use client'

import { useEffect, useState } from 'react'
import type { DomainConfigFormPageProps } from '../../types/form'
import DomainsPageSkeleton from '../skeletons/admin-form-page-skeleton'
import AdminDomainFormFrame from './admin-panel-form'
import AdminPanelHeader from './admin-panel-header'
import AdminPanelTabs from './admin-panel-tabs'

type Props = DomainConfigFormPageProps & {
  description?: string
  onUpdateDescription?: (desc: string) => Promise<any>
}

export default function DomainConfigFormPage({
  domainName,
  tabNames,
  tabDataByTab,
  onSubmit,
  isLoading,
  isFormLoading,
  description,
  onUpdateDescription,
}: Props) {
  const [activeTab, setActiveTab] = useState(tabNames[0] || '')

  useEffect(() => {
    if (tabNames.length > 0 && !activeTab) {
      setActiveTab(tabNames[0])
    }
  }, [tabNames, activeTab])

  // We now pass the full tabDataByTab to the form so the form can be initialized
  // with default values for all sections. The form will still render only the
  // active tab's section UI (passed via activeTab).
  // This avoids losing controlled values when switching tabs.
  const rawTabData = tabDataByTab

  if (isLoading) {
    return <DomainsPageSkeleton />
  }

  // If description prop is provided and an onUpdateDescription callback is given,
  // make the header description editable. Otherwise keep a static text.
  const headerDescription =
    description ?? 'Configure the default domain settings here'
  const editable = Boolean(description !== undefined && onUpdateDescription)

  return (
    <div className="flex h-screen w-full flex-col">
      <AdminPanelHeader
        title={domainName}
        description={headerDescription}
        editableDescription={editable}
        onSaveDescription={onUpdateDescription}
      />
      <div className="min-h-0 flex-1 overflow-auto pr-6 pl-6">
        <AdminPanelTabs
          tabNames={tabNames}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <div className="flex min-h-0 pb-24">
          <AdminDomainFormFrame
            // pass the full tab data (all sections) so form defaultValues are stable
            data={rawTabData}
            activeTab={activeTab}
            onSubmit={onSubmit}
            isLoading={isFormLoading}
          />
        </div>
      </div>
    </div>
  )
}
