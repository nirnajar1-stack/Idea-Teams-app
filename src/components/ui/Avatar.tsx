import { cn } from '../../lib/cn'

export interface AvatarProps {
  src?: string
  alt: string
  size?: 'sm' | 'md'
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
}

export function Avatar({ src, alt, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn(
          'rounded-full border-2 border-primary-container object-cover',
          sizeClasses[size],
          className,
        )}
      />
    )
  }

  /* PLACEHOLDER: העתיקו תמונת פרופיל ל-src/assets ועברו src ל-Avatar */
  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        'flex items-center justify-center rounded-full border-2 border-primary-container bg-primary-fixed text-label-sm font-bold text-primary',
        sizeClasses[size],
        className,
      )}
    >
      רו
    </div>
  )
}
