'use client'

import Image from 'next/image'
import React from 'react'

const LoginLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="grid min-h-svh bg-background lg:grid-cols-2 lg:items-center">
      <div className="flex flex-1 bg-background sm:justify-center lg:justify-end p-6 md:p-10 lg:h-80 z-50 lg:animate-horizontalTranslate">
        <Image
          alt="SOGo"
          src="/images/sogo-full.svg"
          width={350}
          height={275}
          priority
        />
      </div>
      <div className="flex flex-1 bg-primary sm:justify-center lg:items-center lg:justify-start p-6 sm:p-10 lg:h-80">
        <div className="w-full max-w-xs">{children}</div>
      </div>
    </div>
  )
}

export default LoginLayout
