import { cn } from '../../lib/cn'

export interface AvatarProps {
  src?: string
  alt: string
  size?: 'sm' | 'md'
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8 text-label-sm',
  md: 'h-10 w-10 text-label-md',
}

export function Avatar({ src, alt, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn(
          'rounded-full border border-border-light object-cover shadow-soft',
          sizeClasses[size],
          className,
        )}
      />
    )
  }

  const initials = alt.slice(0, 2)

  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        'flex items-center justify-center rounded-full border border-border-light bg-primary font-semibold text-on-primary shadow-soft',
        sizeClasses[size],
        className,
      )}
    >
      {initials}
    </div>
  )
}
