import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-bg-base transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-accent text-white shadow-accent-glow hover:bg-accent-bright",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-white/10 bg-white/[0.03] backdrop-blur-md hover:bg-white/[0.08] hover:border-white/20 text-foreground transition-all shadow-linear",
        secondary:
          "bg-white/[0.05] text-foreground hover:bg-white/[0.1] shadow-linear",
        ghost: "hover:bg-white/[0.05] hover:text-foreground text-foreground-muted transition-colors",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-md px-4",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      
      {/* Shine effect for default variant */}
      {variant === 'default' && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer-sweep" />
        </div>
      )}
      
      {/* Inner highlight for elevated look */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/20 pointer-events-none z-20 opacity-0 group-hover:opacity-100 transition-opacity" />
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
