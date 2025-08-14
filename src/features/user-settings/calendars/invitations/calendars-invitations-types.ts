export interface CalendarInvitations {
  disable_notifications: boolean
  prevent_invitations: boolean
  invitations_wlist: string[]
}

export interface CalendarInvitationsFormProps {
  data: CalendarInvitations | undefined
  update: (_data: CalendarInvitations) => void
}

export interface InvitationWblistOption {
  value: string
  label: string
}
