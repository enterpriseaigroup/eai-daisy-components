/**
 * NotFound - Configurator V2 Component
 *
 * Component NotFound from not-found.tsx
 *
 * @migrated from DAISY v1
 */

  /**
   * BUSINESS LOGIC: NotFound
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements NotFound logic
   * 2. Returns computed result
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Processes data and applies business logic
   * Output: Computed value or side effect
   *
   */
export default function NotFound() {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-xl mt-4">Page not found</p>
        <p className="mt-2">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
      </div>
    );
  }