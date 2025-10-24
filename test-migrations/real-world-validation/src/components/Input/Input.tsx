/**
 * Input - Configurator V2 Component
 *
 * Component Input from input.tsx
 *
 * @migrated from DAISY v1
 */

import * as React from "react"

import { cn } from "@/lib/utils"

  /**
   * BUSINESS LOGIC: Input
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements Input logic
   * 2. Calls helper functions: cn
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - cn() - Function call
   *
   * WHY IT CALLS THEM:
   * - cn: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls cn to process data
   * Output: Computed value or side effect
   *
   */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Figma token-based styles
        "flex h-9 w-full min-w-0 border bg-[var(--Background,#FFF)] border-[var(--Input,#E4E4E7)] rounded-[var(--Radius-Rounded-Medium,6px)]",

        // Additional styles
        "text-foreground file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
