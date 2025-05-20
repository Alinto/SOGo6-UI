'use client'
import { HashIcon, Save } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '../button'
import { Input } from '../input'
import { InputWithIcon } from '../input-with-icon'

type ClassValue =
  | ClassArray
  | ClassDictionary
  | string
  | number
  | bigint
  | null
  | boolean
  | undefined
type ClassDictionary = Record<string, unknown>
type ClassArray = ClassValue[]
function clsx(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(' ')
}

type hsl = {
  h: number
  s: number
  l: number
}

type hex = {
  hex: string
}
type Color = hsl & hex

function hslToHex({ h, s, l }: hsl) {
  s /= 100
  l /= 100

  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(Math.min(k(n) - 3, 9 - k(n), 1), -1)
  const r = Math.round(255 * f(0))
  const g = Math.round(255 * f(8))
  const b = Math.round(255 * f(4))

  const toHex = (x: number) => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

function hexToHsl({ hex }: hex): hsl {
  // Ensure the hex string is formatted properly
  hex = hex.replace(/^#/, '')

  // Handle 3-digit hex
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('')
  }

  // Pad with zeros if incomplete
  while (hex.length < 6) {
    hex += '0'
  }

  // Convert hex to RGB
  let r = parseInt(hex.slice(0, 2), 16) || 0
  let g = parseInt(hex.slice(2, 4), 16) || 0
  let b = parseInt(hex.slice(4, 6), 16) || 0

  // Then convert RGB to HSL
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s: number
  const l = (max + min) / 2

  if (max === min) {
    h = s = 0 // achromatic
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
    h *= 360
  }

  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) }
}

const DraggableColorCanvas = ({
  h,
  s,
  l,
  handleChange,
}: hsl & {
  handleChange: (e: Partial<Color>) => void
}) => {
  const [dragging, setDragging] = useState(false)
  const colorAreaRef = useRef<HTMLDivElement>(null)

  const calculateSaturationAndLightness = useCallback(
    (clientX: number, clientY: number) => {
      if (!colorAreaRef.current) return
      const rect = colorAreaRef.current.getBoundingClientRect()
      const x = clientX - rect.left
      const y = clientY - rect.top
      const xClamped = Math.max(0, Math.min(x, rect.width))
      const yClamped = Math.max(0, Math.min(y, rect.height))
      const newSaturation = Math.round((xClamped / rect.width) * 100)
      const newLightness = 100 - Math.round((yClamped / rect.height) * 100)
      handleChange({ s: newSaturation, l: newLightness })
    },
    [handleChange]
  )

  // Mouse event handlers
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      e.preventDefault()
      calculateSaturationAndLightness(e.clientX, e.clientY)
    },
    [calculateSaturationAndLightness]
  )

  const handleMouseUp = useCallback(() => {
    setDragging(false)
  }, [])

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(true)
    calculateSaturationAndLightness(e.clientX, e.clientY)
  }

  // Touch event handlers
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      if (touch) {
        calculateSaturationAndLightness(touch.clientX, touch.clientY)
      }
    },
    [calculateSaturationAndLightness]
  )

  const handleTouchEnd = useCallback(() => {
    setDragging(false)
  }, [])

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault()
    const touch = e.touches[0]
    if (touch) {
      setDragging(true)
      calculateSaturationAndLightness(touch.clientX, touch.clientY)
    }
  }

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove, { passive: false })
      window.addEventListener('touchend', handleTouchEnd)
    } else {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [
    dragging,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
  ])

  return (
    <div
      ref={colorAreaRef}
      className="h-48 w-full touch-auto overscroll-none rounded-xl border border-zinc-200 dark:touch-auto dark:border-zinc-700"
      style={{
        background: `linear-gradient(to top, #000, transparent, #fff), linear-gradient(to left, hsl(${h}, 100%, 50%), #bbb)`,
        position: 'relative',
        cursor: 'crosshair',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div
        className="color-selector border-4 border-white ring-1 ring-zinc-200 dark:border-zinc-900 dark:ring-zinc-700"
        style={{
          position: 'absolute',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: `hsl(${h}, ${s}%, ${l}%)`,
          transform: 'translate(-50%, -50%)',
          left: `${s}%`,
          top: `${100 - l}%`,
          cursor: dragging ? 'grabbing' : 'grab',
        }}
      ></div>
    </div>
  )
}

function sanitizeHex(val: string) {
  const sanitized = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  return sanitized
}

interface ColorPickerProps {
  onChange: (color: string) => void
  defaultValue?: string
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  defaultValue = '#1C9488',
  onChange,
}) => {
  // Initialize from controlled prop or a default
  const [color, setColor] = useState<Color>(() => {
    const hex = sanitizeHex(defaultValue)
    const hsl = hexToHsl({ hex: hex })
    return { ...hsl, hex: sanitizeHex(hex) }
  })

  // Update from hex input
  const handleHexInputChange = (newVal: string) => {
    const hex = sanitizeHex(newVal)
    if (hex.length === 6) {
      const hsl = hexToHsl({ hex })
      setColor({ ...hsl, hex: hex })
      if (onChange) onChange(hex)
    } else if (hex.length < 6) {
      setColor((prev) => ({ ...prev, hex: hex }))
      if (onChange) onChange(hex)
    }
  }

  return (
    <>
      <div
        style={
          {
            '--thumb-border-color': '#000000',
            '--thumb-ring-color': '#666666',
          } as React.CSSProperties
        }
        className="z-30 flex w-full max-w-[300px] flex-col items-center gap-3 overscroll-none rounded-2xl border border-zinc-200 bg-white p-4 shadow-md select-none dark:border-zinc-700 dark:bg-zinc-900"
      >
        <DraggableColorCanvas
          {...color}
          handleChange={(parital) => {
            setColor((prev) => {
              const value = { ...prev, ...parital }
              const hex_formatted = hslToHex({
                h: value.h,
                s: value.s,
                l: value.l,
              })

              return { ...value, hex: hex_formatted }
            })
          }}
        />
        <Input
          type="range"
          min="0"
          max="360"
          value={color.h}
          className="dark:border-zinc-7000 h-3 w-full cursor-pointer appearance-none rounded-full border border-zinc-200 bg-white text-white placeholder:text-white dark:border-zinc-700"
          style={{
            background: `linear-gradient(to right, 
            hsl(0, 100%, 50%), 
            hsl(60, 100%, 50%), 
            hsl(120, 100%, 50%), 
            hsl(180, 100%, 50%), 
            hsl(240, 100%, 50%), 
            hsl(300, 100%, 50%), 
            hsl(360, 100%, 50%))`,
          }}
          onChange={(e) => {
            const hue = e.target.valueAsNumber
            setColor((prev) => {
              const { hex, ...rest } = { ...prev, h: hue }
              const hex_formatted = hslToHex({ ...rest })
              return { ...rest, hex: hex_formatted }
            })
          }}
        />
        <div className="relative h-fit w-full">
          <div className="absolute inset-y-0 left-0 mt-[30px] flex h-full items-center px-2">
            <HashIcon className="size-4 text-zinc-600" />
          </div>
        </div>
        <div className="flex w-full items-center justify-between gap-2">
          <InputWithIcon
            id="color-value"
            ActionComponent={
              <div
                className="size-7 rounded-md border border-zinc-200 dark:border-zinc-800"
                style={{
                  backgroundColor: `hsl(${color.h}, ${color.s}%, ${color.l}%)`,
                }}
              />
            }
            className={clsx(
              'flex w-full items-center justify-between rounded-lg border p-2 text-sm focus:ring-1',
              //10 px for the paddng on the hashtag, 16px for the icon
              'pl-[26px]',
              // 10px for the padding on the color badge, 28px for the color badge
              'pr-[38px]',
              // bg & text
              'bg-black/[2.5%] text-zinc-700 dark:bg-white/[2.5%] dark:text-zinc-200',
              // borders & backgrounds
              'border-zinc-200 dark:border-zinc-700',
              // hover classes
              'hover:border-zinc-300',
              'dark:hover:border-zinc-600',
              // focus classes
              'focus:border-zinc-300 focus:ring-zinc-300',
              'dark:focus:border-zinc-600 dark:focus:ring-zinc-600',
              // selection styles
              'selection:bg-black/20 selection:text-black',
              'dark:selection:bg-white/30 dark:selection:text-white'
            )}
            value={color.hex}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleHexInputChange(e.target.value)
            }}
          />
          <Button
            size="icon"
            onClick={() => {
              onChange(color.hex)
            }}
          >
            <Save />
          </Button>
        </div>
        <div className="absolute inset-y-0 right-0 flex h-full items-center px-[5px]"></div>
      </div>
    </>
  )
}

export default ColorPicker
