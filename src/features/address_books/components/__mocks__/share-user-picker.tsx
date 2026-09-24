import { useState } from 'react'

type SharePickedUser = { uid: string; email: string }

/**
 * Test double for the sharing "Add a user" picker: pressing Enter stands for
 * picking the typed text from the autocomplete (uid and email both set to it).
 */
const ShareUserPicker = ({
  label,
  placeholder,
  duplicateError,
  isDuplicate,
  onAdd,
}: {
  label: string
  placeholder: string
  duplicateError: string
  isDuplicate: (user: SharePickedUser) => boolean
  onAdd: (user: SharePickedUser) => void
}) => {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  return (
    <div>
      <p>{label}</p>
      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== 'Enter') return
          const picked = { uid: value, email: value }
          if (isDuplicate(picked)) {
            setError(duplicateError)
            return
          }
          onAdd(picked)
          setValue('')
        }}
      />
      {error && <p>{error}</p>}
    </div>
  )
}

export default ShareUserPicker
