import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

export function useCopyToClipboard() {
  const t = useTranslations('CONTACT_FORM')

  const copyToClipboard = async (text: string, label?: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(t('copied_to_clipboard.string'), {
        description: label
          ? t('copied_value.string', { value: label })
          : undefined,
        duration: 2000,
      })
    } catch (error) {
      toast.error(t('copy_failed.string'), {
        description: t('copy_failed_description.string'),
        duration: 3000,
      })
    }
  }

  return { copyToClipboard }
}
