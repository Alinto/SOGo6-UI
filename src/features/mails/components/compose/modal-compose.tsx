import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog'
import { Save, Send } from 'lucide-react'
import { useTranslations } from 'next-intl'
import * as React from 'react'
import CustomEditor from './compose'
import ComposeHeader from './compose-header'
import styles from './compose.module.css'

interface ModalComposeProps {
  open: boolean
  onClose: (open: boolean) => void
}

export const ModalCompose: React.FC<ModalComposeProps> = ({
  open,
  onClose,
}) => {
  const t = useTranslations('Mails_Common')
  return (
    <Dialog open={open}>
      <DialogContent
        hideCloseIcon
        className="flex h-11/12 w-full max-w-6xl flex-col overflow-y-auto [&>svg]:hidden"
      >
        <DialogHeader className="">
          <ComposeHeader onClose={onClose} />
        </DialogHeader>
        <div
          className={`flex h-0 flex-1 flex-col overflow-y-auto ${styles.compose_editor}`}
        >
          <CustomEditor />
        </div>
        <DialogFooter className="bg-background z-10 flex h-9 items-center justify-between">
          <Button className="">
            <Save className="h-6 w-6" />
            {t('compose.save_draft.string')}
          </Button>
          <Button className="">
            <Send className="h-6 w-6" />
            {t('compose.send.string')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
