import { Button } from '@/components/ui/button'
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { InputWithLabel } from '@/components/ui/input'
import { useTranslations } from 'next-intl'

interface LinkActionProps {
  name: string
  id: string
}

const LinkAction: React.FC<LinkActionProps> = ({ name, id }) => {
  const t = useTranslations('Address_Books')

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('sidebar.options.link.title.string')}</DialogTitle>
      </DialogHeader>
      <DialogDescription>
        <InputWithLabel
          type="text"
          label={t('sidebar.options.link.labels.name.string', { name })}
          className="w-full"
        />
      </DialogDescription>
      <DialogFooter className="sm:justify-start">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Close
          </Button>
        </DialogClose>
      </DialogFooter>
    </>
  )
}

export default LinkAction
