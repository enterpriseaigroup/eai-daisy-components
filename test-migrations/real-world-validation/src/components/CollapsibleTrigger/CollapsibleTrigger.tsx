/**
 * CollapsibleTrigger - Configurator V2 Component
 *
 * Component CollapsibleTrigger from collapsible.tsx
 *
 * @migrated from DAISY v1
 */

"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

  /**
   * BUSINESS LOGIC: Collapsible
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements Collapsible logic
   * 2. Returns computed result
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Processes data and applies business logic
   * Output: Computed value or side effect
   *
   */
function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

  /**
   * BUSINESS LOGIC: CollapsibleTrigger
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements CollapsibleTrigger logic
   * 2. Returns computed result
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Processes data and applies business logic
   * Output: Computed value or side effect
   *
   */
function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  )
}

  /**
   * BUSINESS LOGIC: CollapsibleContent
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements CollapsibleContent logic
   * 2. Returns computed result
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Processes data and applies business logic
   * Output: Computed value or side effect
   *
   */
function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
