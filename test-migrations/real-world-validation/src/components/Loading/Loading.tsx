/**
 * Loading - Configurator V2 Component
 *
 * Component Loading from loading.tsx
 *
 * @migrated from DAISY v1
 */

  /**
   * BUSINESS LOGIC: Loading
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements Loading logic
   * 2. Returns computed result
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Processes data and applies business logic
   * Output: Computed value or side effect
   *
   */
export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90">
      <div className="text-center">
        <div className="inline-block w-20 h-20 mb-4 border-t-2 border-b-2 border-gray-500 rounded-full animate-spin"></div>
        <p className="mt-4 font-semibold text-gray-600 text-[14px] font-geist">
          Preparing Your Experience ...
        </p>
      </div>
    </div>
  );
}