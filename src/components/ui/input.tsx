import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-xl border border-gray-300 bg-white/90 px-4 py-2 text-base shadow-sm transition-all duration-200",
          "placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/60 focus:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "hover:border-gray-400 hover:shadow-md",
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }
