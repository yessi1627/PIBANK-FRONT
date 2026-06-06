import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[#00C85320] text-[#00C853] border border-[#00C85340]',
        secondary: 'bg-[#1A1A1A] text-[#A0A0A0] border border-[#2A2A2A]',
        destructive: 'bg-[#FF3B3020] text-[#FF3B30] border border-[#FF3B3040]',
        warning: 'bg-[#FF950020] text-[#FF9500] border border-[#FF950040]',
        info: 'bg-[#0A84FF20] text-[#0A84FF] border border-[#0A84FF40]',
        outline: 'border border-[#2A2A2A] text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
