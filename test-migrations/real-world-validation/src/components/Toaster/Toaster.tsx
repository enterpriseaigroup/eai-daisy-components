/**
 * Toaster - Configurator V2 Component
 *
 * Component Toaster from sonner.tsx
 *
 * @migrated from DAISY v1
 */

"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

  /**
   * BUSINESS LOGIC: Toaster
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements Toaster logic
   * 2. Calls helper functions: useTheme
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useTheme() - Function call
   *
   * WHY IT CALLS THEM:
   * - useTheme: State update
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useTheme to process data
   * Output: Computed value or side effect
   *
   */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
