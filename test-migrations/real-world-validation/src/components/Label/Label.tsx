/**
 * Label - Configurator V2 Component
 *
 * Component Label from label.tsx
 *
 * @migrated from DAISY v1
 */

"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

  /**
   * BUSINESS LOGIC: Label
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements Label logic
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
function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
