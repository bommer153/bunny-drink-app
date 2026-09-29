import { cn } from '@/lib/utils'

interface AnimatedGradientTextProps {
  children: React.ReactNode
  className?: string
}

/**
 * Text with a sweeping gradient animation.
 * Wraps children in a <span> that uses background-clip: text.
 */
export function AnimatedGradientText({ children, className }: AnimatedGradientTextProps) {
  return (
    <span
      className={cn(
        'animate-gradient bg-[linear-gradient(to_right,#a78bfa,#ec4899,#f59e0b,#a78bfa)]',
        'bg-[length:200%_auto] bg-clip-text text-transparent',
        className,
      )}
    >
      {children}
    </span>
  )
}
