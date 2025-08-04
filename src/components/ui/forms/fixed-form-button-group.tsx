import { AccessibleIcon } from '@radix-ui/react-accessible-icon'
import { Save, Undo } from 'lucide-react'
import React from 'react'
import { Button } from '../button'

interface FixedFormButtonGroupProps {
  onReset: () => void
  disableReset: boolean
  disableSubmit: boolean
}

const FixedFormButtonGroup: React.FC<FixedFormButtonGroupProps> = ({
  onReset,
  disableReset,
  disableSubmit,
}) => {
  return (
    <div className="fixed right-12 bottom-20 flex justify-end gap-4 pt-6">
      <Button
        className="rounded-full p-7 shadow-lg"
        size={'icon'}
        type="button"
        disabled={disableReset}
        onClick={() => onReset()}
      >
        <AccessibleIcon label="Reset">
          <Undo size={40} />
        </AccessibleIcon>
      </Button>
      <Button
        className="rounded-full p-7 shadow-lg"
        size={'icon'}
        type="submit"
        disabled={disableSubmit}
      >
        <Save size={40} />
      </Button>
    </div>
  )
}

export default FixedFormButtonGroup
