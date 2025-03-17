import { AccessibleIcon } from '@radix-ui/react-accessible-icon'
import { Save, Undo } from 'lucide-react'
import React from 'react'
import { Button } from '../../button'

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
    <div className="fixed bottom-20 right-12 gap-4 flex justify-end pt-6">
      <Button
        className="p-7 rounded-full shadow-lg"
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
        className="p-7 rounded-full shadow-lg"
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
