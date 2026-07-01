import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface ContactHeaderProps {
  firstName: string
  lastName: string
  organization?: string
  jobTitle?: string
  photo?: string
}

export function ContactHeader({
  firstName,
  lastName,
  organization,
  jobTitle,
  photo,
}: ContactHeaderProps) {
  const fullName = `${firstName} ${lastName}`.trim()
  const subtitle = [organization, jobTitle].filter(Boolean).join(' • ')

  return (
    <div className="flex min-w-0 items-start gap-3 sm:gap-4">
      <Avatar className="h-14 w-14 shrink-0 sm:h-16 sm:w-16 xl:h-20 xl:w-20">
        {photo ? (
          <AvatarImage src={photo} alt={fullName} className="object-cover" />
        ) : (
          <AvatarFallback className="text-lg font-semibold sm:text-xl xl:text-2xl">
            {firstName[0]?.toUpperCase()}
            {lastName[0]?.toUpperCase()}
          </AvatarFallback>
        )}
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h1
          className="text-foreground truncate text-xl font-semibold sm:text-2xl xl:text-3xl"
          id="contact-name"
        >
          {fullName}
        </h1>
        {subtitle && (
          <p className="text-muted-foreground truncate text-sm">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
