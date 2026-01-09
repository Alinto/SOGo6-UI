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
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
      <Avatar className="h-20 w-20 shrink-0 sm:h-24 sm:w-24">
        {photo ? (
          <AvatarImage src={photo} alt={fullName} className="object-cover" />
        ) : (
          <AvatarFallback className="text-2xl font-semibold sm:text-3xl">
            {firstName[0]?.toUpperCase()}
            {lastName[0]?.toUpperCase()}
          </AvatarFallback>
        )}
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h1
          className="text-foreground truncate text-2xl font-semibold sm:text-3xl"
          id="contact-name"
        >
          {fullName}
        </h1>
        {subtitle && (
          <p className="text-muted-foreground truncate text-sm sm:text-base">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
