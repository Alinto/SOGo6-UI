import { BasicCalendar } from '@/app/[locale]/(loggedin)/u/[account]/[folder]/for_demo'
import { Progress } from '@/components/ui/progress'
import { SidebarGroupContent } from '@/components/ui/sidebar'
import { useLocale } from 'next-intl'
import React from 'react'

const tasks = [
  {
    uid: '12345678-90ab-cdef-1234-567890abcdef',
    summary: 'Appointment with John Doe',
    description: 'Discuss project updates',
    status: 'NEEDS-ACTION',
    priority: 5,
    completed: false,
    dtstart: '2023-10-01T10:00:00Z',
    dtend: '2023-10-01T11:00:00Z',
    created: '2023-09-25T09:00:00Z',
    lastModified: '2023-09-25T09:00:00Z',
    categories: ['Meeting'],
    location: 'Conference Room 1',
    percentComplete: 50,
    url: 'https://cal.example.com/calendars/user/tasks/12345678-90ab-cdef-1234-567890abcdef.ics',
  },
  {
    uid: '23456789-01bc-def2-3456-789012345678',
    summary: 'Appointment with Filipe Doe',
    description: 'Review design mockups',
    status: 'NEEDS-ACTION',
    priority: 5,
    completed: false,
    dtstart: '2023-10-01T10:00:00Z',
    dtend: '2023-10-01T11:00:00Z',
    created: '2023-09-25T09:00:00Z',
    lastModified: '2023-09-25T09:00:00Z',
    categories: ['Design'],
    location: 'Conference Room 2',
    percentComplete: 20,
    url: 'https://cal.example.com/calendars/user/tasks/23456789-01bc-def2-3456-789012345678.ics',
  },
  {
    uid: '34567890-12cd-ef34-5678-901234567890',
    summary: 'Appointment with Jane Doe',
    description: 'Finalize project plan',
    status: 'NEEDS-ACTION',
    priority: 5,
    completed: false,
    dtstart: '2023-10-01T15:00:00Z',
    dtend: '2023-10-01T16:00:00Z',
    created: '2023-09-25T09:00:00Z',
    lastModified: '2023-09-25T09:00:00Z',
    categories: ['Planning'],
    location: 'Conference Room 3',
    percentComplete: 0,
    url: 'https://cal.example.com/calendars/user/tasks/34567890-12cd-ef34-5678-901234567890.ics',
  },
]

function formatDate(dateStr: string, locale: string) {
  const date = new Date(dateStr)
  return date.toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const TaskItem: React.FC = ({ task }) => {
  const locale = useLocale()
  return (
    <div className="m-2 w-11/12 rounded-lg border p-2 shadow-sm">
      <div className="text-xs">{formatDate(task.dtstart, locale)}</div>
      <div className="font-medium">{task.summary}</div>
      <div className="flex items-center gap-2">
        <span className="text-xs">Location:</span>
        <span className="text-xs">{task.location}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs">Completion:</span>
        <Progress value={task.percentComplete} className="h-2 w-32" />
        <span className="text-xs">{task.percentComplete}%</span>
      </div>
    </div>
  )
}

const TasksContent: React.FC = () => {
  return (
    <SidebarGroupContent>
      <BasicCalendar className="rounded-none" />
      <div className="flex flex-col items-stretch">
        {tasks.map((task) => (
          <TaskItem key={task.uid} task={task} />
        ))}
      </div>
    </SidebarGroupContent>
  )
}

export default TasksContent
