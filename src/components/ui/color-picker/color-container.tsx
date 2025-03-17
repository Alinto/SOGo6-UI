import { cn } from '@/lib/utils'
import { PaintBucket } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import MotionButton from '../buttons/motion-button'
import ColorBox from './color-box'
import ColorPanel from './color-panel'

interface ColorContainerProps {
  initialColor?: string
  onColorChange: (color: string) => void
  className?: string
  containerId: string
}

const ColorContainer: React.FC<ColorContainerProps> = ({
  onColorChange,
  className,
  initialColor,
  containerId,
}) => {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [containerRef])

  return (
    <div
      id={containerId}
      ref={containerRef}
      className={cn('relative', className)}
    >
      <MotionButton
        type="button"
        onClick={() => setOpen(!open)}
        whileTap={{ scale: 0.97 }}
        variant={'ghost'}
        style={{ color: initialColor }}
        className={cn(
          '-z-0 text-sm font-medium rounded-full relative transition-colors duration-75',
          open ? 'text-slate-300' : 'text-slate-500'
        )}
      >
        <PaintBucket />
      </MotionButton>
      {open && (
        <ColorBox>
          <ColorPanel setColor={onColorChange} />
        </ColorBox>
      )}
    </div>
  )
}

export default ColorContainer
