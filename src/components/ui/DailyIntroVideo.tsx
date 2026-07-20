import { useCallback, useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX, X } from 'lucide-react'
import { INTRO_VIDEO_SRC } from '../../constants/app'
import { cn } from '../../lib/cn'
import { markMonthlyIntroVideoShown } from '../../lib/monthlyIntroVideo'
import type { AppUser } from '../../types/user'

export interface DailyIntroVideoProps {
  user: AppUser
  onComplete: () => void
}

export function DailyIntroVideo({ user, onComplete }: DailyIntroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [exiting, setExiting] = useState(false)
  const [muted, setMuted] = useState(true)
  const finishedRef = useRef(false)

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    markMonthlyIntroVideoShown(user)
    setExiting(true)
    window.setTimeout(onComplete, 450)
  }, [user, onComplete])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    void video.play().catch(() => {
      /* autoplay blocked — user can tap play via controls if needed */
    })
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [finish])

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-[250] flex items-center justify-center bg-black transition-opacity duration-500',
        exiting && 'pointer-events-none opacity-0',
      )}
      role="dialog"
      aria-modal
      aria-label="סרטון פתיחה"
    >
      <video
        ref={videoRef}
        src={INTRO_VIDEO_SRC}
        autoPlay
        playsInline
        muted={muted}
        onEnded={finish}
        className="max-h-full max-w-full object-contain"
      />

      <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-4">
        <button
          type="button"
          onClick={finish}
          className="flex items-center gap-2 rounded-full bg-black/50 px-4 py-2 font-label-md text-white backdrop-blur-sm transition-colors hover:bg-black/70"
        >
          <X className="h-4 w-4" />
          דלג
        </button>
        <button
          type="button"
          onClick={toggleMute}
          className="rounded-full bg-black/50 p-2.5 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
          aria-label={muted ? 'הפעלת שמע' : 'השתקה'}
        >
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      </div>
    </div>
  )
}
