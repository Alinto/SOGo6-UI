import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PasswordInput } from "@/components/ui/input-password";
import { useTranslations } from "next-intl";

/* TRANSLATIONS_TODO */
export function LoginAuthForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const t = useTranslations("Login");
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="password">{t("password_label")}</Label>
          <PasswordInput
            id="password"
            placeholder={t("password_placeholder")}
            required
          />
        </div>
        <Button type="submit" className="w-full">
          {t("login")}
        </Button>
        <div className="flex items-center space-x-2">
          <Switch id="airplane-mode" />
          <Label htmlFor="airplane-mode">{t("remember_me")}</Label>
        </div>
      </div>
    </form>
  );
}
