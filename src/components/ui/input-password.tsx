import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EyeClosed, EyeIcon } from "lucide-react";

const PasswordInput = (props: React.ComponentPropsWithoutRef<"input">) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        className="pr-10"
        {...props}
      />
      <Button
        type="button"
        className="absolute right-0 top-0"
        size={"icon"}
        variant="ghost"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <EyeClosed size={60} /> : <EyeIcon size={60} />}
      </Button>
    </div>
  );
};

export { PasswordInput };
