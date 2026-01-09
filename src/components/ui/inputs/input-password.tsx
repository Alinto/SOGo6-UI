import { EyeClosed, EyeIcon } from 'lucide-react'
import React from 'react'
import { InputWithIcon } from './input-with-icon'

const PasswordInput = (props: React.ComponentPropsWithoutRef<'input'>) => {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <InputWithIcon
      type={showPassword ? 'text' : 'password'}
      className="pr-10"
      role="textbox"
      ActionComponent={
        showPassword ? (
          <EyeClosed data-testid="eye-closed-icon" size={18} />
        ) : (
          <EyeIcon data-testid="eye-icon" size={18} />
        )
      }
      onActionClick={() => setShowPassword(!showPassword)}
      {...props}
    />
  )
}

export { PasswordInput }
