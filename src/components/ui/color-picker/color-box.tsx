import React from 'react'

interface Props {
  children: React.ReactNode
}

const ColorBox: React.FC<Props> = ({ children }) => {
  return (
    <div
      data-testid="color-box"
      className="z-50 rounded-xl w-80 h-96 bg-slate-900 border border-slate-900 absolute mt-2 left-1/2 -translate-x-1/2 p-4 text-white"
    >
      <div
        data-testid="color-box-triangle"
        className="absolute top-0 -translate-y-1.5 left-1/2 -translate-x-1/2 border-b-[8px] border-b-slate-900 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent"
      />
      {children}
    </div>
  )
}

export default ColorBox
