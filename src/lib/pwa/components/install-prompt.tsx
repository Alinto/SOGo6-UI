'use client'

import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { useInstallPrompt } from '@/lib/pwa/hooks/use-install-prompt'
import { Download, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'

export default function InstallPrompt() {
  const t = useTranslations('PWA')
  const { isInstallable, install } = useInstallPrompt()
  const [isInstalling, setIsInstalling] = useState(false)

  if (!isInstallable) {
    return null
  }

  const handleInstallClick = async () => {
    setIsInstalling(true)
    
    try {
      await install()
      toast.success(t('install.success.string'))
    } catch {
      toast.error(t('install.error.string'))
    } finally {
      setIsInstalling(false)
    }
  }

  return (
    <DropdownMenuItem
      className="cursor-pointer"
      onClick={handleInstallClick}
      disabled={isInstalling}
    >
      {isInstalling ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      <span>
        {isInstalling ? t('install.installing.string') : t('install.button.string')}
      </span>
    </DropdownMenuItem>
  )
}
