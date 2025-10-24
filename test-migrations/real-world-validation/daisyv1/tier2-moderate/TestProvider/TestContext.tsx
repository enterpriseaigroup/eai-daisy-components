import { createContext, useContext, useState, ReactNode } from "react";

// Define the type for the context value
interface TestContextType {
  value: string;
  setValue: (newValue: string) => void;
}

// Create the context with a default value
const TestContext = createContext<TestContextType | undefined>(undefined);

export const TestProvider = ({ children }: { children: ReactNode }) => {
  const [value, setValue] = useState("Initial value");

  return (
    <TestContext.Provider value={{ value, setValue }}>
      {children}
    </TestContext.Provider>
  );
};

export const useTestContext = (): TestContextType => {
  const context = useContext(TestContext);
  if (!context) {
    throw new Error("useTestContext must be used within a TestProvider");
  }
  return context;
};