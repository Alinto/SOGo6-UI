import { redirect } from 'next/navigation'

export default function RootPage() {
  console.log('RootPage')
  redirect('u/0/inbox')
}
