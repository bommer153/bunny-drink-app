import { cn } from '@/lib/utils'

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
}

/**
 * Button with a sweeping shimmer highlight on top of a purple→pink gradient.
 * Uses the `animate-shimmer` Tailwind utility defined in index.css @theme.
 */
export function ShimmerButton({ children, className, ...props }: ShimmerButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        // Layout
        'relative overflow-hidden',
        // Background gradient
        'bg-[linear-gradient(135deg,#7c3aed,#db2777)]',
        // Text
        'text-white font-black tracking-widest',
        // Shadow glow
        'shadow-[0_0_18px_rgba(139,92,246,0.45)]',
        // Transition
        'transition-all duration-200',
        // States
        'hover:shadow-[0_0_28px_rgba(139,92,246,0.7)] hover:scale-105',
        'active:scale-95',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'disabled:hover:scale-100 disabled:hover:shadow-[0_0_18px_rgba(139,92,246,0.45)]',
        // Shimmer pseudo-element via Tailwind arbitrary before: utilities
        'before:absolute before:inset-0 before:pointer-events-none',
        'before:bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.28)_50%,transparent_70%)]',
        'before:bg-[size:200%_100%] before:animate-shimmer',
        className,
      )}
    >
      {children}
    </button>
  )
}
