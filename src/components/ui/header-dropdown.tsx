import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookA,
  CalendarCog,
  CircleUserRound,
  Cog,
  LogOut,
  Mail,
  UserRoundCog,
} from "lucide-react";

const HeaderDropdown: React.FC = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="hover:cursor-pointer" asChild>
        <div className="flex items-center pl-4 gap-4 space-x-2">
          <Avatar>
            <AvatarImage src="/images/account-avatar.svg" />
            <AvatarFallback>HF</AvatarFallback>
          </Avatar>
          <div className="text-background">
            <div>Henry Fafenback</div>
            <div className="block text-sm">sbarre@alinto.eu</div>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuCheckboxItem>
          <Cog className="pr-2" /> Admin panel
        </DropdownMenuCheckboxItem>
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem>
          <CircleUserRound className="pr-2" />
          Profile
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>
          <UserRoundCog className="pr-2" />
          Preferences
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem>
          <CalendarCog className="pr-2" />
          Agenda
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>
          <BookA className="pr-2" /> Addresses Book
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>
          <Mail className="pr-2" /> Email
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem>
          <LogOut className="pr-2" /> Logout
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HeaderDropdown;
