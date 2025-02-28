import { getRequestConfig } from "next-intl/server";
import { routing } from "@/middleware";
import fs from "fs";
import deepmerge from "deepmerge";
import { transformJson } from "@/lib/i18n/utils";

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  const defaultFileList = fs.readdirSync(
    `src/messages/${routing.defaultLocale}`
  );
  const defaultMessages = {};
  for (const file of defaultFileList) {
    const newMessages = transformJson({
      ...(await import(`@/messages/${routing.defaultLocale}/${file}`)).default,
    });
    Object.assign(defaultMessages, newMessages);
  }
  const messages = {};
  if (locale === routing.defaultLocale) {
    const fileList = fs.readdirSync(`src/messages/${locale}`);
    for (const file of fileList) {
      const newMessages = transformJson({
        ...(await import(`@/messages/${locale}/${file}`)).default,
      });
      Object.assign(messages, newMessages);
    }
  }
  return {
    locale,
    messages: deepmerge(defaultMessages, messages),
  };
});
