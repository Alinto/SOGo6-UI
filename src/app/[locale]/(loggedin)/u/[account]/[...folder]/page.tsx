import React from 'react'

interface PageProps {
  params: {
    locale: string
    account: string
    folder: string
  }
}

const Page: React.FC<PageProps> = ({ params }) => {
  const { locale, account, folder } = params

  return (
    <div>
      <h1>Folder Page</h1>
      <p>Locale: {locale}</p>
      <p>Account: {account}</p>
      <p>Folder: {folder}</p>
    </div>
  )
}

export default Page
