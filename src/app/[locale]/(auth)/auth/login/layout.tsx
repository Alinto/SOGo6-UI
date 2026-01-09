import Image from 'next/image'
import React from 'react'

const LoginLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="bg-background grid min-h-svh lg:grid-cols-2 lg:items-center">
      <div className="bg-background lg:animate-horizontalTranslate z-50 flex flex-1 justify-center p-6 sm:justify-center md:p-10 lg:min-h-[450px] lg:items-center lg:justify-end">
        <Image
          alt="SOGo"
          src="/images/sogo-full.svg"
          width={350}
          height={275}
          priority
        />
      </div>
      <div className="bg-primary flex flex-1 justify-center p-6 sm:justify-center sm:p-10 lg:min-h-[400px] lg:items-center lg:justify-start">
        <div className="w-full max-w-xs">{children}</div>
      </div>
    </div>
  )
}

export default LoginLayout
