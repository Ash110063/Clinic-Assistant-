import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border border-input bg-white/90 px-3 py-1 text-sm text-ink shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-sage focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-[invalid=true]:border-ink aria-[invalid=true]:ring-[3px] aria-[invalid=true]:ring-peach disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Input };
