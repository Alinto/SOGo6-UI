import { CloudDownload, Image as ImageIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { MailShowImageProps } from './types'

export function MailShowImage({ onShowImages }: MailShowImageProps) {
  const t = useTranslations('Mails_Common')
  return (
    <div
      className="mb-2 flex cursor-pointer gap-2 rounded bg-[hsl(var(--chart-2)/0.1)] px-4 py-3 text-sm"
      onClick={onShowImages}
    >
      <ImageIcon className="text-chart-2" size={22} />
      <span className="text-card-foreground flex-1">
        This email contains external images. Click to display them.
      </span>
      <CloudDownload size={22} />
    </div>
  )
}
