import { cn } from '../../lib/cn'

export interface DogChatAvatarProps {
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  className?: string
}

const sizeMap = {
  sm: 'h-10 w-10',
  md: 'h-14 w-14',
  lg: 'h-16 w-16',
}

export function DogChatAvatar({
  size = 'md',
  animated = true,
  className,
}: DogChatAvatarProps) {
  return (
    <span
      className={cn(
        'relative inline-flex items-center justify-center',
        sizeMap[size],
        animated && 'dog-avatar-bounce',
        className,
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 64 64"
        className="h-full w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="32" cy="34" r="22" fill="#fbbf24" />
        <ellipse cx="18" cy="22" rx="9" ry="14" fill="#f59e0b" className="dog-ear-left" />
        <ellipse cx="46" cy="22" rx="9" ry="14" fill="#f59e0b" className="dog-ear-right" />
        <circle cx="24" cy="32" r="3.5" fill="#0f172a" />
        <circle cx="40" cy="32" r="3.5" fill="#0f172a" />
        <circle cx="25" cy="31" r="1" fill="#fff" />
        <circle cx="41" cy="31" r="1" fill="#fff" />
        <ellipse cx="32" cy="40" rx="5" ry="4" fill="#b45309" />
        <path
          d="M28 40 Q32 43 36 40"
          stroke="#1e293b"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M48 38 C54 40 58 44 56 48"
          stroke="#f59e0b"
          strokeWidth="3"
          strokeLinecap="round"
          className={animated ? 'dog-tail-wag' : undefined}
        />
      </svg>
    </span>
  )
}
