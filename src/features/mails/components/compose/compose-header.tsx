import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Paperclip, User, X } from 'lucide-react'
import React from 'react'

interface ComposeHeaderProps {
  onClose: () => void
}

const ComposeHeader: React.FC<ComposeHeaderProps> = ({ onClose }) => {
  const [showCc, setShowCc] = React.useState(false)
  const [showBcc, setShowBcc] = React.useState(false)
  return (
    <>
      <div className="flex justify-between gap-2">
        <div className="flex items-center gap-2">
          <User className="text-muted-foreground h-9 w-9" />
          <Input className="min-w-3xl" />
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-4"
            onClick={onClose}
          >
            <X className="text-muted-foreground h-6 w-6" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </div>
      <div className="mt-2 flex w-full items-center">
        <Input
          placeholder="To"
          className="w-full rounded-tr-none rounded-br-none"
        />
        <div className="flex items-center">
          <Button
            variant="outline"
            className={`rounded-none border-r-0 border-l-0 ${showCc ? 'bg-accent text-accent-foreground' : ''}`}
            size={'sm'}
            onClick={() => setShowCc((prev) => !prev)}
          >
            Cc
          </Button>
          <Button
            variant="outline"
            className={`rounded-tl-none rounded-bl-none ${showBcc ? 'bg-accent text-accent-foreground' : ''}`}
            size={'sm'}
            onClick={() => setShowBcc((prev) => !prev)}
          >
            Bcc
          </Button>
        </div>
      </div>
      {showCc && (
        <div className="mt-2 flex w-full items-center">
          <Input placeholder="Cc" className="w-full" />
        </div>
      )}
      {showBcc && (
        <div className="mt-2 flex w-full items-center">
          <Input placeholder="Bcc" className="w-full" />
        </div>
      )}
      <div className="mt-2 flex w-full items-center">
        <Input
          placeholder="Subject"
          className="w-full rounded-tr-none rounded-br-none border-r-0"
        />
        <div className="flex items-center">
          <Button
            variant="outline"
            className={`rounded-tl-none rounded-bl-none`}
            size={'sm'}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </>
  )
}

export default ComposeHeader
