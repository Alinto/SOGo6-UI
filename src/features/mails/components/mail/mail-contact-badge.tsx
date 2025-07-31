import { TooltipButton } from '@/components/ui/buttons/tooltip-button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ContactPopoverContent } from './mail-contact-popover'
import { EmailContact } from './types'

export function ContactBadge({ contact }: { contact: EmailContact }) {
  const display = contact.name || contact.email
  const badgeClass =
    'bg-muted/70 cursor-pointer rounded-full px-3 py-1 text-sm transition-colors h-auto'

  return (
    <Popover>
      <PopoverTrigger asChild>
        <TooltipButton
          tooltip={contact.name ? contact.email : undefined}
          variant="ghost"
          className={badgeClass}
          tabIndex={0}
          type="button"
        >
          {display}
        </TooltipButton>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <ContactPopoverContent />
      </PopoverContent>
    </Popover>
  )
}
