import { ReactNode } from 'react'

interface OthersLayoutProps {
  children: ReactNode
}

const OthersLayout = ({ children }: OthersLayoutProps) => {
  return <div>{children}</div>
}

export default OthersLayout
