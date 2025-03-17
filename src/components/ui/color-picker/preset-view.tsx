import { cn } from '@/lib/utils'
import React from 'react'
import { Button } from '../button'

interface PresetViewProps {
  setColor: (color: string) => void
}

export const colors: string[] = [
  '#FF5733',
  '#33FF57',
  '#3357FF',
  '#FF33A1',
  '#A133FF',
  '#33FFF5',
  '#F5FF33',
  '#FF8C33',
  '#8C33FF',
  '#33FF8C',
  '#FF3333',
  '#33FF33',
  '#3333FF',
  '#FF33FF',
  '#33FFFF',
  '#FFFF33',
  '#FF6633',
  '#6633FF',
  '#33FF66',
  '#FF3366',
  '#66FF33',
  '#3366FF',
  '#FF33CC',
  '#33CCFF',
  '#CCFF33',
  '#FF9933',
  '#9933FF',
  '#33FF99',
  '#FF3399',
  '#99FF33',
  '#3399FF',
  '#FFCC33',
  '#33CC99',
  '#CC33FF',
  '#33FFCC',
]

const PresetView: React.FC<PresetViewProps> = ({ setColor }) => {
  return (
    <div className="flex gap-3 flex-wrap justify-center my-4">
      {colors.map((color, index) => (
        <Button
          key={index}
          type="button"
          size="icon"
          variant={'ghost'}
          className={cn(
            'relative flex justify-center items-center',
            `hover:bg-opacity-10`
          )}
          onClick={() => setColor(color)}
        >
          <div
            className="w-7 h-7 border-none rounded-full z-10"
            style={{ backgroundColor: color }}
          />
        </Button>
      ))}
    </div>
  )
}

export default PresetView
