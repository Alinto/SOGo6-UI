'use client'
import SelectForm from '@/components/ui/forms/select-form'
import { useTranslations } from 'next-intl'

interface ReminderPickerProps {
  value: string
  onChange: (value: string) => void
}

export function ReminderPicker({ value, onChange }: ReminderPickerProps) {
  const t = useTranslations('COMPONENTS')
  return (
    <SelectForm
      onValueChange={onChange}
      value={value}
      options={[
        { value: '-1', label: t('duration-picker.noReminder') },
        { value: '5', label: t('duration-picker.5min') },
        { value: '10', label: t('duration-picker.10min') },
        { value: '15', label: t('duration-picker.15min') },
        { value: '30', label: t('duration-picker.30min') },
        { value: '45', label: t('duration-picker.45min') },
        { value: '60', label: t('duration-picker.1h') },
        { value: '120', label: t('duration-picker.2h') },
        { value: '300', label: t('duration-picker.5h') },
        { value: '900', label: t('duration-picker.15h') },
        { value: '1440', label: t('duration-picker.1d') },
        { value: '2880', label: t('duration-picker.2d') },
        { value: '10080', label: t('duration-picker.1w') },
      ]}
    />
  )
}
