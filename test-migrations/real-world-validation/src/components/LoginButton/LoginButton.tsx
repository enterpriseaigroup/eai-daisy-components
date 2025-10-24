/**
 * LoginButton - Configurator V2 Component
 *
 * Component LoginButton from LoginButton.tsx
 *
 * @migrated from DAISY v1
 */

import { useMsal } from "@azure/msal-react";

  /**
   * BUSINESS LOGIC: LoginButton
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements LoginButton logic
   * 2. Calls helper functions: useMsal, instance.loginRedirect
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useMsal() - Function call
   * - instance.loginRedirect() - Function call
   *
   * WHY IT CALLS THEM:
   * - useMsal: Required functionality
   * - instance.loginRedirect: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useMsal, instance.loginRedirect to process data
   * Output: Computed value or side effect
   *
   */
export const LoginButton =  () => {
  const { instance } = useMsal();

    /**
     * BUSINESS LOGIC: handleLogin
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Implements handleLogin logic
     * 2. Calls helper functions: instance.loginRedirect
     * 3. Returns computed result
     *
     * WHAT IT CALLS:
     * - instance.loginRedirect() - Function call
     *
     * WHY IT CALLS THEM:
     * - instance.loginRedirect: Required functionality
     *
     * DATA FLOW:
     * Input: Component state and props
     * Processing: Calls instance.loginRedirect to process data
     * Output: Computed value or side effect
     *
     */
  const handleLogin = () => {
    instance.loginRedirect({
      scopes: ["openid", "profile", "email"],
      prompt: 'create',
    });
  };

  return <button onClick={handleLogin}>Login</button>;
};