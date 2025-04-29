import AppHeader from '@/components/app-header'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import Sidebar from '@/features/address_books/components/sidebar/sidebar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar>
        <Sidebar />
      </AppSidebar>
      <SidebarInset>
        <AppHeader />
        <div className="flex flex-1 mt-20 flex-col gap-4 p-4 pt-2">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
