import { Calendar, Contact2, ListChecks, Mail, NotebookText } from 'lucide-react'

/** Lucide icons shared between the main sidebar tab and the fast-access rail. */
export const ModuleNavIcon = {
  Mail: Mail,
  AddressBook: Contact2,
  Calendar: Calendar,
  Tasks: ListChecks,
  Notes: NotebookText,
} as const
