/**
 * RadioGroupItem - Configurator V2 Component
 *
 * Component RadioGroupItem from radio-group.tsx
 *
 * @migrated from DAISY v1
 */

"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

  /**
   * BUSINESS LOGIC: RadioGroup
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements RadioGroup logic
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
function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  )
}

  /**
   * BUSINESS LOGIC: RadioGroupItem
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements RadioGroupItem logic
   * 2. Calls helper functions: cn, cn, cn
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - cn() - Function call
   * - cn() - Function call
   * - cn() - Function call
   *
   * WHY IT CALLS THEM:
   * - cn: Required functionality
   * - cn: Required functionality
   * - cn: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls cn, cn, cn to process data
   * Output: Computed value or side effect
   *
   */
function RadioGroupItem({
  className,
  hasFormBricks = false,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item> & {
  hasFormBricks?: boolean
}) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 relative",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className={cn(
          "flex items-center justify-center w-full h-full",
          hasFormBricks && "relative"
        )}
      >
        <CircleIcon
          className={cn(
            "fill-primary size-2",
            hasFormBricks && "absolute inset-0 m-auto"
          )}
          style={
            hasFormBricks
              ? {
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 9999,
                  pointerEvents: 'none',
                  width: '8px',
                  height: '8px',
                }
              : undefined
          }
        />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }