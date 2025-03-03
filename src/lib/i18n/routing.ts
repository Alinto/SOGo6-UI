import { defineRouting } from "next-intl/routing";
import { getDefaultLocale, getLocales } from "@/middleware";

export default defineRouting({
  locales: getLocales(),
  defaultLocale: getDefaultLocale(),
});
