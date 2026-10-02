import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-20 w-full rounded-lg border border-input bg-white/90 px-3 py-2 text-sm text-ink shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-sage focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
