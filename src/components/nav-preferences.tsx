import { type LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function Nav({
  sections,
}: {
  sections: {
    name: string;
    url: string;
    icon: LucideIcon;
  }[];
}) {
  return (
    // <SidebarGroup className="group-data-[collapsible=icon]:visible">
    <SidebarGroup>
      <SidebarMenu>
        {sections.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              title={item.name}
              size={"lg"}
              className="text-lg pl-5"
              asChild
            >
              <a href={item.url}>
                <item.icon />
                <span>{item.name}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
