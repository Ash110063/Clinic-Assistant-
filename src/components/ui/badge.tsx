import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-mint text-white",
        secondary: "border-transparent bg-mist text-sage-deep",
        slate: "border-transparent bg-slate-mist text-slate-deep",
        ink: "border-transparent bg-slate-dark text-white",
        outline: "border-border bg-white/70 text-ink-soft",
        glass: "border-white bg-white/80 text-sage-deep",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";
  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
