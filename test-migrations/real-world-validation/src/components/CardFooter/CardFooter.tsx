/**
 * CardFooter - Configurator V2 Component
 *
 * Component CardFooter from card.tsx
 *
 * @migrated from DAISY v1
 */

import * as React from "react"

import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority";



const cardVariants = cva(
  "rounded-lg border shadow-sm flex flex-col box-border", // base
  {
    variants: {
      variant: {
        default: "bg-white text-card-foreground border-[#E4E4E7] p-6 gap-6 w-[43.75rem] mx-auto my-4",
        bot:"bg-[#F8F8F8] text-[#18181B] p-4 w-full font-sans text-[var(--font-size-very-small)]",
        user: "bg-[#1D1D1D] text-[#FAFAFA] p-4 max-w-[80%] w-fit ml-auto break-words whitespace-pre-wrap", 
        ghost: "bg-transparent border-none shadow-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);


export interface CardProps
  extends React.ComponentProps<"div">,
  VariantProps<typeof cardVariants> { }

  /**
   * BUSINESS LOGIC: Card
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements Card logic
   * 2. Calls helper functions: cn, cardVariants
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - cn() - Function call
   * - cardVariants() - Function call
   *
   * WHY IT CALLS THEM:
   * - cn: Required functionality
   * - cardVariants: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls cn, cardVariants to process data
   * Output: Computed value or side effect
   *
   */
const Card = ({ className, variant, ...props }: CardProps) => {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, className }))}
      {...props}
    />
  );
};

  /**
   * BUSINESS LOGIC: CardHeader
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements CardHeader logic
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
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

  /**
   * BUSINESS LOGIC: CardTitle
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements CardTitle logic
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
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "text-[1.5rem] font-semibold leading-[2rem] tracking-[0.025rem] text-foreground font-sans", 
        className
      )}
      {...props}
    />
  )
}

  /**
   * BUSINESS LOGIC: CardDescription
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements CardDescription logic
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
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

  /**
   * BUSINESS LOGIC: CardAction
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements CardAction logic
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
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

  /**
   * BUSINESS LOGIC: CardContent
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements CardContent logic
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
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("flex flex-col gap-6", className)}
      {...props}
    />
  )
}

  /**
   * BUSINESS LOGIC: CardFooter
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements CardFooter logic
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
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
