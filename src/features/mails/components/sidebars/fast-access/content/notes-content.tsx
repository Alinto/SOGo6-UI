import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { SidebarGroupContent } from '@/components/ui/sidebar'
import { Pencil } from 'lucide-react'
import React, { useState } from 'react'

const notes = [
  {
    uid: 'note-1',
    summary: 'Buy groceries',
    content: 'Milk, eggs, bread, and cheese.',
    created: '2023-10-01T09:00:00Z',
  },
  {
    uid: 'note-2',
    summary: 'Project ideas',
    content: 'Explore CalDAV integration for the new app.',
    created: '2023-10-02T14:30:00Z',
  },
  {
    uid: 'note-3',
    summary: 'Meeting notes',
    content: 'Discussed project timeline and deliverables.',
    created: '2023-10-03T11:15:00Z',
  },
]

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const NotesContent: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<(typeof notes)[0] | null>(null)
  const [editSummary, setEditSummary] = useState('')
  const [editContent, setEditContent] = useState('')

  const handleEdit = (note: (typeof notes)[0]) => {
    setEditingNote(note)
    setEditSummary(note.summary)
    setEditContent(note.content)
    setOpen(true)
  }

  const handleSave = () => {
    // Save logic here (e.g., update state or call API)
    setOpen(false)
  }

  return (
    <>
      <SidebarGroupContent>
        {notes.map((note) => (
          <div
            key={note.uid}
            className="m-2 mt-4 flex flex-col items-start rounded-lg border-1 p-3 shadow-md"
          >
            <div className="flex w-full items-center justify-between">
              <div className="text-muted-foreground text-xs">
                {formatDate(note.created)}
              </div>
              <Button
                size="icon"
                variant="outline"
                onClick={() => handleEdit(note)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
            <div className="font-medium">{note.summary}</div>
            <div className="text-muted-foreground text-sm">{note.content}</div>
          </div>
        ))}
      </SidebarGroupContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <Input
                className=""
                value={editSummary}
                onChange={(e) => setEditSummary(e.target.value)}
              />
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <textarea
              className="rounded border px-2 py-1"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>Save</Button>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default NotesContent
