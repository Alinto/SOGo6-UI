import {
  Calendar1,
  ClipboardCheck,
  Contact2,
  Mail,
  NotepadText,
} from 'lucide-react'

/** Lucide icons shared between the main sidebar tab and the fast-access rail. */
export const ModuleNavIcon = {
  Mail: Mail,
  AddressBook: Contact2,
  Calendar: Calendar1,
  Tasks: ClipboardCheck,
  Notes: NotepadText,
} as const
