import React from 'react'

interface Props {
  children: React.ReactNode
}

const ColorBox: React.FC<Props> = ({ children }) => {
  return (
    <div
      data-testid="color-box"
      className="border-border bg-popover text-popover-foreground absolute left-1/2 z-50 mt-2 h-96 w-80 -translate-x-1/2 rounded-xl border p-4"
    >
      <div
        data-testid="color-box-triangle"
        className="border-b-popover absolute top-0 left-1/2 h-0 w-0 -translate-x-1/2 -translate-y-1.5 border-r-[8px] border-b-[8px] border-l-[8px] border-r-transparent border-l-transparent"
      />
      {children}
    </div>
  )
}

export default ColorBox
