import { APP_LOGO_SRC, APP_NAME, APP_NAME_FULL } from '../../constants/app'
import { cn } from '../../lib/cn'

const sizeMap = {
  xs: { img: 'h-9 w-9', text: 'text-base', sub: 'text-[9px]' },
  sm: { img: 'h-11 w-11', text: 'text-lg', sub: 'text-[10px]' },
  md: { img: 'h-14 w-14', text: 'text-headline-md', sub: 'text-label-sm' },
  lg: { img: 'h-20 w-20', text: 'text-headline-lg', sub: 'text-label-md' },
  xl: { img: 'h-32 max-w-[280px] w-auto', text: 'text-headline-lg', sub: 'text-label-md' },
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
          <span className={cn('block font-label-sm uppercase tracking-wider text-secondary', s.sub)}>
            System
          </span>
        </div>
      )}
    </div>
  )
}
