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
        role="textbox"
        {...props}
      />
      <Button
        type="button"
        size={"icon"}
        variant="ghost"
        className="absolute right-0 top-0"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? (
          <EyeClosed data-testid="eye-closed-icon" size={24} />
        ) : (
          <EyeIcon data-testid="eye-icon" size={24} />
        )}
      </Button>
    </div>
  );
};

export { PasswordInput };
