/**
 * DialogContent - Configurator V2 Component
 *
 * Component DialogContent from dialog.tsx
 *
 * @migrated from DAISY v1
 */

"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

  /**
   * BUSINESS LOGIC: Dialog
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements Dialog logic
   * 2. Returns computed result
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Processes data and applies business logic
   * Output: Computed value or side effect
   *
   */
function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

  /**
   * BUSINESS LOGIC: DialogTrigger
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements DialogTrigger logic
   * 2. Returns computed result
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Processes data and applies business logic
   * Output: Computed value or side effect
   *
   */
function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

  /**
   * BUSINESS LOGIC: DialogPortal
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements DialogPortal logic
   * 2. Returns computed result
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Processes data and applies business logic
   * Output: Computed value or side effect
   *
   */
function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

  /**
   * BUSINESS LOGIC: DialogClose
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements DialogClose logic
   * 2. Returns computed result
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Processes data and applies business logic
   * Output: Computed value or side effect
   *
   */
function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

  /**
   * BUSINESS LOGIC: DialogOverlay
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements DialogOverlay logic
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
function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

  /**
   * BUSINESS LOGIC: DialogContent
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements DialogContent logic
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
function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "z-[9999]",
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "grid w-full max-w-[calc(100vw-2rem)] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          margin: 0, // prevent potential formbricks or layout margin bugs
          zIndex: 9999
        }}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
            style={{ minHeight: 0 }}
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

  /**
   * BUSINESS LOGIC: DialogHeader
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements DialogHeader logic
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
function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

  /**
   * BUSINESS LOGIC: DialogFooter
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements DialogFooter logic
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
function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

  /**
   * BUSINESS LOGIC: DialogTitle
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements DialogTitle logic
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
function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  )
}

  /**
   * BUSINESS LOGIC: DialogDescription
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements DialogDescription logic
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
function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
