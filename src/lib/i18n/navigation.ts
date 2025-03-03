import { createNavigation } from "next-intl/navigation";
import { routing } from "@/middleware";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
