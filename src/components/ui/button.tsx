import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "glass-strong bg-gradient-primary text-primary-foreground hover:shadow-primary hover:scale-105 rounded-full",
        destructive: "glass-strong bg-gradient-danger text-destructive-foreground hover:shadow-danger hover:scale-105 rounded-full",
        outline: "glass border-white/20 hover:glass-strong hover:scale-105 rounded-full",
        secondary: "glass bg-secondary/50 text-secondary-foreground hover:glass-strong hover:scale-105 rounded-full",
        ghost: "glass hover:glass-strong hover:scale-105 rounded-full",
        link: "text-primary underline-offset-4 hover:underline font-medium rounded-full",
        hero: "glass-strong bg-gradient-primary text-white hover:scale-110 shadow-primary animate-glow rounded-full",
        emergency: "glass-strong bg-gradient-danger text-white hover:scale-110 shadow-danger animate-pulse-danger rounded-full",
        success: "glass-strong bg-gradient-success text-success-foreground hover:shadow-success hover:scale-105 rounded-full",
        warning: "glass-strong bg-gradient-warning text-warning-foreground hover:shadow-warning hover:scale-105 rounded-full",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-full px-4 text-sm",
        lg: "h-14 rounded-full px-8 text-lg font-semibold",
        xl: "h-16 rounded-full px-12 text-xl font-bold",
        icon: "h-12 w-12 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }