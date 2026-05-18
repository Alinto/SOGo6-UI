import '@testing-library/jest-dom'
import { Calendar, Contact2, ListChecks, Mail, NotebookText } from 'lucide-react'
import { ModuleNavIcon } from '../module-nav-icons'

describe('ModuleNavIcon', () => {
  it('maps each module key to the expected Lucide component', () => {
    expect(ModuleNavIcon.Mail).toBe(Mail)
    expect(ModuleNavIcon.AddressBook).toBe(Contact2)
    expect(ModuleNavIcon.Calendar).toBe(Calendar)
    expect(ModuleNavIcon.Tasks).toBe(ListChecks)
    expect(ModuleNavIcon.Notes).toBe(NotebookText)
  })

  it('is frozen as a const object export', () => {
    expect(Object.keys(ModuleNavIcon).sort()).toEqual([
      'AddressBook',
      'Calendar',
      'Mail',
      'Notes',
      'Tasks',
    ])
  })
})
