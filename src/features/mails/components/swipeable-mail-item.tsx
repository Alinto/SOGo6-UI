import { cn } from '@/lib/utils'
import { useDrag } from '@use-gesture/react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Eye, Trash2 } from 'lucide-react'
import React, { memo, useCallback, useRef, useState } from 'react'

interface SwipeableMailItemProps {
  children: React.ReactNode
  onDelete: () => void
  onMarkAsSeen: () => void
  onSwipeStart?: () => void
  onSwipeEnd?: () => void
  disabled?: boolean
}

const SWIPE_THRESHOLD = 0.4 // 40% of container width
const VERTICAL_THRESHOLD = 10 // px - vertical movement threshold to cancel swipe
const HORIZONTAL_THRESHOLD = 10 // px - minimum horizontal movement to start swipe

const SwipeableMailItem: React.FC<SwipeableMailItemProps> = ({
  children,
  onDelete,
  onMarkAsSeen,
  onSwipeStart,
  onSwipeEnd,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isExiting, setIsExiting] = useState(false)
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(
    null
  )
  const [isDragging, setIsDragging] = useState(false)

  const x = useMotionValue(0)

  // Transform x position to background opacity (0 to 1 based on threshold)
  const markAsSeenOpacity = useTransform(x, [0, 100], [0, 1])
  const deleteOpacity = useTransform(x, [-100, 0], [1, 0])

  // Transform x position to icon scale
  const markAsSeenScale = useTransform(x, [0, 80, 120], [0.5, 1, 1.2])
  const deleteScale = useTransform(x, [-120, -80, 0], [1.2, 1, 0.5])

  const handleSwipeComplete = useCallback((direction: 'left' | 'right') => {
    setExitDirection(direction)
    setIsExiting(true)
  }, [])

  const handleExitComplete = useCallback(() => {
    if (exitDirection === 'right') {
      onMarkAsSeen()
    } else if (exitDirection === 'left') {
      onDelete()
    }
  }, [exitDirection, onMarkAsSeen, onDelete])
  const bind = useDrag(
    ({ down, movement: [mx, my], first, last, cancel, velocity: [vx] }) => {
      if (disabled || isExiting) {
        cancel()
        return
      }

      // On first movement, check if it's more vertical than horizontal
      if (first) {
        const absX = Math.abs(mx)
        const absY = Math.abs(my)

        // If vertical movement exceeds threshold before horizontal, cancel swipe
        if (absY > VERTICAL_THRESHOLD && absY > absX) {
          cancel()
          return
        }

        // Only start swipe if horizontal movement exceeds threshold
        if (absX < HORIZONTAL_THRESHOLD) {
          return
        }

        setIsDragging(true)
        onSwipeStart?.()
      }

      const containerWidth = containerRef.current?.offsetWidth || 300
      const threshold = containerWidth * SWIPE_THRESHOLD

      if (down) {
        // While dragging, update position
        x.set(mx)
      } else if (last) {
        // On release
        setIsDragging(false)
        onSwipeEnd?.()

        const absX = Math.abs(mx)
        const isSwipeRight = mx > 0
        const hasReachedThreshold = absX >= threshold
        const hasHighVelocity = Math.abs(vx) > 0.5

        if (hasReachedThreshold || hasHighVelocity) {
          // Trigger action
          handleSwipeComplete(isSwipeRight ? 'right' : 'left')
        } else {
          // Snap back to original position
          x.set(0)
        }
      }
    },
    {
      axis: 'x',
      filterTaps: true,
      pointer: { touch: true },
    }
  )

  if (isExiting) {
    return (
      <motion.div
        className="relative overflow-hidden"
        initial={{ height: 'auto', opacity: 1 }}
        animate={{
          height: 0,
          opacity: 0,
          marginTop: 0,
          marginBottom: 0,
          paddingTop: 0,
          paddingBottom: 0,
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        onAnimationComplete={handleExitComplete}
      >
        <div className="relative">
          {/* Background indicators */}
          <div
            className={cn(
              'absolute inset-0 flex items-center px-4',
              exitDirection === 'right'
                ? 'justify-start bg-green-500'
                : 'justify-end bg-red-500'
            )}
          >
            {exitDirection === 'right' ? (
              <Eye className="h-6 w-6 text-white" />
            ) : (
              <Trash2 className="h-6 w-6 text-white" />
            )}
          </div>
          {/* Content sliding out */}
          <motion.div
            className="bg-background relative"
            initial={{ x: exitDirection === 'right' ? x.get() : x.get() }}
            animate={{
              x: exitDirection === 'right' ? '100%' : '-100%',
            }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </div>
      </motion.div>
    )
  }

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Mark as seen background (green - right swipe) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-start bg-green-500 px-4"
        style={{ opacity: markAsSeenOpacity }}
      >
        <motion.div style={{ scale: markAsSeenScale }}>
          <Eye className="h-6 w-6 text-white" />
        </motion.div>
      </motion.div>

      {/* Delete background (red - left swipe) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-end bg-red-500 px-4"
        style={{ opacity: deleteOpacity }}
      >
        <motion.div style={{ scale: deleteScale }}>
          <Trash2 className="h-6 w-6 text-white" />
        </motion.div>
      </motion.div>

      {/* Swipeable content */}
      <motion.div
        style={{
          x,
          touchAction: isDragging ? 'none' : 'pan-y',
        }}
        className="bg-background relative cursor-grab active:cursor-grabbing"
        {...(bind() as React.ComponentProps<typeof motion.div>)}
      >
        {children}
      </motion.div>
    </div>
  )
}

export default memo(SwipeableMailItem)
