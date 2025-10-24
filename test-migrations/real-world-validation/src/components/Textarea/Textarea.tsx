/**
 * Textarea - Configurator V2 Component
 *
 * Component Textarea from textarea.tsx
 *
 * @migrated from DAISY v1
 */

import * as React from "react";
import TextareaAutosize from "react-textarea-autosize";
import { cn } from "@/lib/utils";

interface TextareaProps extends React.ComponentProps<typeof TextareaAutosize> {
  variant?: "default" | "address" | "lot";
  value?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = "default", value = "", ...props }, ref) => {
    const isFilled = value.trim().length > 0;

    return (
      <TextareaAutosize
        ref={ref}
        data-slot="textarea"
        value={value}
        minRows={1}
        maxRows={2}
        className={cn(
          variant === "default" &&
          "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          (variant === "address" || variant === "lot") &&
          cn(
            "w-full resize-none overflow-hidden rounded-md border border-[var(--Input,#E4E4E7)] bg-[var(--Background,#FFFFFF)] px-3 py-1.5",
            "font-sans font-normal text-base leading-snug tracking-normal align-middle text-[var(--Secondary-Foreground,#18181B)]",
            "placeholder:text-[#999] transition-all",
            !isFilled && "align-bottom"
          ),
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
export { Textarea };
