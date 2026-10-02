import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-mint text-slate-dark font-bold shadow-soft-btn rounded-[10px] hover:brightness-105",
        gradient:
          "bg-cta text-slate-dark font-bold shadow-cta rounded-[10px] hover:brightness-105",
        dark: "bg-slate-dark text-white shadow-soft-btn rounded-[10px] hover:brightness-110",
        destructive: "bg-ink text-white hover:bg-ink/90",
        outline:
          "border border-border bg-white/80 text-ink hover:bg-mist/60 hover:text-sage-deep",
        secondary: "bg-secondary text-secondary-foreground hover:bg-mist",
        slate: "bg-slate-mist text-slate-deep hover:bg-slate/20",
        ghost: "text-ink-soft hover:bg-mist/60 hover:text-sage-deep",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md gap-1.5 px-3 text-xs",
        lg: "h-12 rounded-xl px-6 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
