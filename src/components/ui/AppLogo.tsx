import { APP_LOGO_SRC, APP_NAME, APP_NAME_FULL, APP_TAGLINE } from '../../constants/app'
import { cn } from '../../lib/cn'

const sizeMap = {
  xs: { img: 'h-9 w-9', text: 'text-base', sub: 'text-[10px]' },
  sm: { img: 'h-11 w-11', text: 'text-lg', sub: 'text-xs' },
  md: { img: 'h-14 w-14', text: 'text-headline-md', sub: 'text-sm' },
  lg: { img: 'h-20 w-20', text: 'text-headline-lg', sub: 'text-base' },
  xl: { img: 'h-32 max-w-[280px] w-auto', text: 'text-headline-lg', sub: 'text-base' },
} as const

export interface AppLogoProps {
  size?: keyof typeof sizeMap
  showLabel?: boolean
  imageOnly?: boolean
  className?: string
}

export function AppLogo({
  size = 'md',
  showLabel = true,
  imageOnly = false,
  className,
}: AppLogoProps) {
  const s = sizeMap[size]

  const imgClass = cn(s.img, 'object-contain', className)

  if (imageOnly || size === 'xl') {
    return (
      <img
        src={APP_LOGO_SRC}
        alt={`${APP_NAME_FULL} — עוגן`}
        className={imgClass}
        draggable={false}
      />
    )
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <img
        src={APP_LOGO_SRC}
        alt=""
        aria-hidden
        className={cn(s.img, 'shrink-0 object-contain')}
        draggable={false}
      />
      {showLabel && (
        <div className="min-w-0 leading-tight">
          <span className={cn('block font-display font-bold text-on-surface', s.text)}>
            {APP_NAME}
          </span>
          <span
            className={cn(
              'block font-label-md font-semibold leading-snug text-primary',
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
