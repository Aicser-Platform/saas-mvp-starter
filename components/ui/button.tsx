import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-1 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md',
        destructive:
          'bg-destructive text-white shadow-sm hover:bg-destructive/90 focus-visible:ring-destructive/40',
        outline:
          'border border-border bg-background shadow-xs hover:bg-muted/60 hover:border-border/80 dark:bg-input/20 dark:hover:bg-input/40',
        secondary:
          'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/70',
        ghost:
          'hover:bg-muted/60 hover:text-foreground',
        link:
          'text-primary underline-offset-4 hover:underline',
        gradient:
          'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-sm hover:shadow-md hover:opacity-90',
        'soft-primary':
          'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20',
        'soft-destructive':
          'bg-destructive/10 text-destructive hover:bg-destructive/15 border border-destructive/20',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 text-xs has-[>svg]:px-2.5',
        lg: 'h-10 rounded-lg px-6 text-sm has-[>svg]:px-4',
        xl: 'h-12 rounded-xl px-8 text-base has-[>svg]:px-5',
        icon: 'size-9 rounded-lg',
        'icon-sm': 'size-8 rounded-md',
        'icon-lg': 'size-10 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
