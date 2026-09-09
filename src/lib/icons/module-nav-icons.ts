import {
  Calendar1,
  ClipboardCheck,
  Contact2,
  Mail,
  NotepadText,
} from 'lucide-react'

/** Lucide icons shared between the main sidebar tab and the fast-access rail. */
export const ModuleNavIcon = {
  Mail: { icon: Mail, title: 'Mail' },
  AddressBook: { icon: Contact2, title: 'Address Books' },
  Calendar: { icon: Calendar1, title: 'Calendars' },
  Tasks: { icon: ClipboardCheck, title: 'Tasks' },
  Notes: { icon: NotepadText, title: 'Notes' },
} as const
