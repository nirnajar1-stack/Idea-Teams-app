import { Upload, Loader2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { storageAvailable, uploadIdeaFile } from '../../api/storageApi'
import type { IdeaAttachment } from '../../types/idea'

export function AttachmentUpload({
  ideaId,
  disabled,
  onUploaded,
}: {
  ideaId: string
  disabled?: boolean
  onUploaded: (attachment: IdeaAttachment) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  if (!storageAvailable()) return null

  const handleFile = async (file: File) => {
    setUploading(true)
    try {
      const att = await uploadIdeaFile(ideaId, file)
      onUploaded(att)
      toast.success('הקובץ הועלה בהצלחה')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'העלאה נכשלה')
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/*,application/pdf"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
          e.target.value = ''
        }}
      />
      <button
        type="button"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 border border-dashed border-primary/30 py-3 font-label-md text-primary transition-colors hover:bg-primary/5 disabled:opacity-50"
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {uploading ? 'מעלה…' : 'העלאת קובץ (PDF / תמונה)'}
      </button>
    </>
  )
}
