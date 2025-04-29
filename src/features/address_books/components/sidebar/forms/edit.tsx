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

interface EditFormProps {
  name: string
  id: string
}

const EditForm: React.FC<EditFormProps> = ({ name, id }) => {
  const t = useTranslations('Address_Books')

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('sidebar.options.edit.title.string')}</DialogTitle>
      </DialogHeader>
      <DialogDescription>
        <InputWithLabel
          type="text"
          label={t('sidebar.options.edit.labels.name.string', { name })}
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

export default EditForm
