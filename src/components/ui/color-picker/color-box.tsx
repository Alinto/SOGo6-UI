import React from 'react'

interface Props {
  children: React.ReactNode
}

const ColorBox: React.FC<Props> = ({ children }) => {
  return (
    <div
      data-testid="color-box"
      className="absolute left-1/2 z-50 mt-2 h-96 w-80 -translate-x-1/2 rounded-xl border border-slate-900 bg-slate-900 p-4 text-white"
    >
      <div
        data-testid="color-box-triangle"
        className="absolute top-0 left-1/2 h-0 w-0 -translate-x-1/2 -translate-y-1.5 border-r-[8px] border-b-[8px] border-l-[8px] border-r-transparent border-b-slate-900 border-l-transparent"
      />
      {children}
    </div>
  )
}

export default ColorBox
