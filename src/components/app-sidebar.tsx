import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Calendar, Contact, Mail, Settings } from "lucide-react";
import { Nav } from "@/components/nav-preferences";
import Image from "next/image";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="flex h-20">
        <div className="flex justify-center pl-4 pt-3 gap-4 space-x-2">
          <Image
            alt="App Logo"
            src="/images/sogo-full-alt.png"
            width={100}
            height={50}
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <Nav
          sections={[
            {
              name: "general",
              url: "/preferences/general",
              icon: Settings,
            },
            {
              name: "agenda",
              url: "/preferences/agenda",
              icon: Calendar,
            },
            {
              name: "address_book",
              url: "/preferences/address_book",
              icon: Contact,
            },
            {
              name: "email",
              url: "/preferences/email",
              icon: Mail,
            },
          ]}
        />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
