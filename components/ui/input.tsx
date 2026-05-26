import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-10 w-full min-w-0 rounded-lg border border-border/70 bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none',
        'placeholder:text-muted-foreground/60',
        'transition-all duration-150',
        'focus:border-primary/50 focus:ring-2 focus:ring-primary/25 focus:ring-offset-0 focus:bg-background',
        'hover:border-border',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
        'aria-invalid:border-destructive/60 aria-invalid:ring-2 aria-invalid:ring-destructive/20',
        'dark:bg-input/20 dark:border-input/60 dark:hover:border-input dark:focus:border-primary/50',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
