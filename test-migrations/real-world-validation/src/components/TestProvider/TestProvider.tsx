/**
 * TestProvider - Configurator V2 Component
 *
 * Component TestProvider from TestContext.tsx
 *
 * @migrated from DAISY v1
 */

import { createContext, useContext, useState, ReactNode } from "react";

// Define the type for the context value
interface TestContextType {
  value: string;
  setValue: (newValue: string) => void;
}

// Create the context with a default value
const TestContext = createContext<TestContextType | undefined>(undefined);

  /**
   * BUSINESS LOGIC: TestProvider
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements TestProvider logic
   * 2. Calls helper functions: useState
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useState() - Function call
   *
   * WHY IT CALLS THEM:
   * - useState: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useState to process data
   * Output: Computed value or side effect
   *
   */
export const TestProvider = ({ children }: { children: ReactNode }) => {
  const [value, setValue] = useState("Initial value");

  return (
    <TestContext.Provider value={{ value, setValue }}>
      {children}
    </TestContext.Provider>
  );
};

  /**
   * BUSINESS LOGIC: useTestContext
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useTestContext logic
   * 2. Calls helper functions: useContext
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useContext() - Function call
   *
   * WHY IT CALLS THEM:
   * - useContext: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useContext to process data
   * Output: Computed value or side effect
   *
   */
export const useTestContext = (): TestContextType => {
  const context = useContext(TestContext);
  if (!context) {
    throw new Error("useTestContext must be used within a TestProvider");
  }
  return context;
};