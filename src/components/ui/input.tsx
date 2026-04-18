import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full rounded-lg border border-white/10 bg-[#0F0F12] px-4 py-2 text-sm text-foreground ring-offset-bg-base file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-foreground-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-linear",
        className
      )}
      {...props}
    />
  )
}

export { Input }
