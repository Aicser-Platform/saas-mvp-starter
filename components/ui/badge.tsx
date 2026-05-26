import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none transition-all duration-150 select-none',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/85',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20',
        outline:
          'border-border text-foreground bg-transparent hover:bg-muted/50',
        success:
          'border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
        warning:
          'border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
        info:
          'border-transparent bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        pro:
          'border-transparent bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200/80 dark:border-blue-700/50',
        premium:
          'border-transparent bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border-violet-200/80 dark:border-violet-700/50',
        free:
          'border-transparent bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400 border-slate-200/80 dark:border-slate-700/50',
        ghost:
          'border-transparent bg-muted/60 text-muted-foreground hover:bg-muted',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
