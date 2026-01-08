import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTranslations } from 'next-intl'
import { UnsubscribeDialogProps } from './types'

export function UnsubscribeDialog({
  open,
  onOpenChange,
  senderEmail,
}: UnsubscribeDialogProps) {
  const t = useTranslations('MAILS_COMMONS')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card flex w-[92vw] max-w-sm flex-col gap-4 rounded-xl p-4 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-card-foreground text-xl font-semibold">
            {t('mail_display.header.unsubscribe.string')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {t('mail_display.header.unsubscribe-dialog.message.string', {
              email: senderEmail ? `${senderEmail}` : '',
            })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-2 flex justify-end gap-2">
          <DialogClose asChild>
            <Button
              variant="ghost"
              className="text-primary h-auto min-w-0 rounded-full px-3 py-1.5 text-sm"
              type="button"
            >
              {t('mail_display.header.unsubscribe-dialog.cancel.string')}
            </Button>
          </DialogClose>
          <Button
            className="bg-primary hover:bg-primary/80 h-auto min-w-0 rounded-full px-3 py-1.5 text-sm"
            type="button"
          >
            {t('mail_display.header.unsubscribe.string')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
