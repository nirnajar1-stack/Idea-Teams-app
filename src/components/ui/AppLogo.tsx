import { APP_LOGO_SRC, APP_NAME, APP_NAME_FULL, APP_TAGLINE } from '../../constants/app'
import { cn } from '../../lib/cn'

const sizeMap = {
  xs: {
    mark: 'h-8 w-8',
    text: 'text-sm tracking-tight',
    sub: 'text-[9px] tracking-normal',
    gap: 'gap-2',
  },
  sm: {
    mark: 'h-9 w-9',
    text: 'text-base tracking-tight',
    sub: 'text-[10px] tracking-normal',
    gap: 'gap-2.5',
  },
  md: {
    mark: 'h-10 w-10',
    text: 'text-lg tracking-tight',
    sub: 'text-[11px] tracking-normal',
    gap: 'gap-3',
  },
  lg: {
    mark: 'h-14 w-14',
    text: 'text-headline-md tracking-tight',
    sub: 'text-xs tracking-normal',
    gap: 'gap-3.5',
  },
  xl: {
    mark: 'h-32 max-w-[280px] w-auto',
    text: 'text-headline-lg',
    sub: 'text-base',
    gap: 'gap-4',
  },
} as const

export interface AppLogoProps {
  size?: keyof typeof sizeMap
  showLabel?: boolean
  /** מציג את קובץ הלוגו המלא (כולל טקסט בתוך התמונה) — לספלאש / hero */
  imageOnly?: boolean
  className?: string
}

function LogoMark({
  sizeClass,
  className,
}: {
  sizeClass: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'relative shrink-0 overflow-hidden rounded-2xl bg-surface-container-lowest shadow-soft',
        sizeClass,
        className,
      )}
      aria-hidden
    >
      {/* זום לסמל (עוגן+כתר) — מסתיר רקע מלבני וטקסט כפול מתוך ה-PNG */}
      <img
        src={APP_LOGO_SRC}
        alt=""
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full scale-[1.55] object-cover object-[center_20%] select-none"
      />
    </span>
  )
}

export function AppLogo({
  size = 'md',
  showLabel = true,
  imageOnly = false,
  className,
}: AppLogoProps) {
  const s = sizeMap[size]

  if (imageOnly || size === 'xl') {
    return (
      <img
        src={APP_LOGO_SRC}
        alt={`${APP_NAME_FULL} — עוגן`}
        className={cn(s.mark, 'object-contain', className)}
        draggable={false}
      />
    )
  }

  return (
    <div className={cn('flex min-w-0 items-center', s.gap, className)}>
      <LogoMark sizeClass={s.mark} />
      {showLabel && (
        <div className="min-w-0 text-start leading-none">
          <span
            className={cn(
              'block truncate font-display font-semibold tracking-tight text-on-surface',
              s.text,
            )}
          >
            {APP_NAME}
          </span>
          <span
            className={cn(
              'mt-1 block truncate border-t border-border-light pt-1 font-label text-secondary',
              s.sub,
            )}
          >
            {APP_TAGLINE}
          </span>
        </div>
      )}
    </div>
  )
}
