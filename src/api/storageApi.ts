import { getSupabase, isSupabaseEnabled } from '../lib/supabaseClient'
import type { IdeaAttachment } from '../types/idea'

const BUCKET = 'idea-attachments'
const MAX_BYTES = 10 * 1024 * 1024

export function storageAvailable(): boolean {
  return isSupabaseEnabled()
}

function attachmentType(mime: string): IdeaAttachment['type'] {
  if (mime === 'application/pdf') return 'pdf'
  return 'image'
}

export async function uploadIdeaFile(
  ideaId: string,
  file: File,
): Promise<IdeaAttachment> {
  if (!isSupabaseEnabled()) {
    throw new Error('העלאת קבצים זמינה רק עם Supabase')
  }
  if (file.size > MAX_BYTES) {
    throw new Error('הקובץ גדול מ-10MB')
  }

  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin'
  const path = `${ideaId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { error: uploadError } = await getSupabase()
    .storage.from(BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (uploadError) throw uploadError

  const { data } = getSupabase().storage.from(BUCKET).getPublicUrl(path)

  return {
    id: path,
    name: file.name,
    type: attachmentType(file.type),
    url: data.publicUrl,
  }
}

export async function uploadConceptImage(ideaId: string, file: File): Promise<string> {
  const att = await uploadIdeaFile(ideaId, file)
  if (!att.url) throw new Error('לא התקבל URL')
  return att.url
}

export async function deleteStorageFile(path: string): Promise<void> {
  if (!isSupabaseEnabled()) return
  const { error } = await getSupabase().storage.from(BUCKET).remove([path])
  if (error) console.warn('storage delete failed', error.message)
}
