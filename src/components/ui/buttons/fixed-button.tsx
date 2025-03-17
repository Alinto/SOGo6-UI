import React from 'react'

const FixedButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <button
      className={`fixed bottom-20 bg-primary text-background hover:text-primary hover:bg-transparent right-12 p-3 rounded-full shadow-lg ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default FixedButton
