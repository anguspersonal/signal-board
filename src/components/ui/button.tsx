import React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'default' | 'icon'
  children: React.ReactNode
}

const buttonVariants = ({ 
  variant = 'default', 
  size = 'md' 
}: { variant?: 'default' | 'outline' | 'ghost'; size?: 'sm' | 'md' | 'lg' | 'default' | 'icon' } = {}) => {
  const baseClasses = 'disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring font-medium inline-flex items-center justify-center rounded-md transition-colors'
  
  const variants = {
    default: 'bg-primary hover:bg-primary/90 text-primary-foreground',
    outline: 'bg-background border border-input hover:bg-accent hover:text-accent-foreground text-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'
  }
  
  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-12 px-6 text-lg',
    default: 'h-10 px-4 py-2',
    icon: 'h-10 w-10'
  }
  
  return cn(baseClasses, variants[variant], sizes[size])
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ 
  variant = 'default', 
  size = 'md', 
  className = '', 
  children, 
  ...props 
}, ref) => {
  return (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {children}
    </button>
  )
})
Button.displayName = 'Button'

export { buttonVariants } 