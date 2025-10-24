/**
 * MIGRATED: CSS imports removed, replaced with Tailwind classes
 * CONVERSION: Automated by CSS-to-Tailwind transformer
 * DATE: 2025-10-22
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';

/**
 * DAISY v1 Button Component - Original Implementation
 *
 * This is a realistic DAISY v1 component with typical business logic patterns
 * that would need to be transformed for Configurator v2 architecture.
 *
 * Key DAISY v1 patterns to transform:
 * - Custom event handling and analytics
 * - Theme management through CSS classes
 * - Loading state management
 * - Custom tooltip and accessibility logic
 * - Direct DOM manipulation for focus management
 */

export interface ButtonProps {
  /** Button text content */
  children: React.ReactNode;

  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';

  /** Size variant */
  size?: 'small' | 'medium' | 'large';

  /** Disabled state */
  disabled?: boolean;

  /** Loading state with spinner */
  loading?: boolean;

  /** Button type for forms */
  type?: 'button' | 'submit' | 'reset';

  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  /** Custom CSS class */
  className?: string;

  /** Tooltip text */
  tooltip?: string;

  /** Auto-focus on mount */
  autoFocus?: boolean;

  /** Analytics tracking ID */
  trackingId?: string;

  /** Custom data attributes for testing */
  'data-testid'?: string;
}

/**
 * DAISY v1 Button with complex business logic patterns
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'medium',
      disabled = false,
      loading = false,
      type = 'button',
      onClick,
      className = '',
      tooltip,
      autoFocus = false,
      trackingId,
      'data-testid': testId,
      ...rest
    },
    ref
  ) => {
    // Complex state management (to be transformed)
    const [isPressed, setIsPressed] = useState(false);
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [focusVisible, setFocusVisible] = useState(false);
    const internalRef = useRef<HTMLButtonElement>(null);
    const buttonRef =
      (ref as React.RefObject<HTMLButtonElement>) || internalRef;
    const tooltipRef = useRef<HTMLDivElement>(null);
    const pressTimer = useRef<NodeJS.Timeout>();

    // Complex business logic: Auto-focus management
    /**
     * BUSINESS LOGIC: Side Effect
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Monitors autoFocus, disabled for changes
     * 2. Executes .focus functions
     * 3. Runs side effect logic
     *
     * WHAT IT CALLS:
     * - .focus() - Function call
     *
     * WHY IT CALLS THEM:
     * - .focus: Required functionality
     *
     * DATA FLOW:
     * Input: autoFocus, disabled state/props
     * Processing: Calls .focus to process data
     * Output: Side effects executed, cleanup registered
     *
     * DEPENDENCIES:
     * - autoFocus: Triggers when autoFocus changes
     * - disabled: Triggers when disabled changes
     *
     */
    useEffect(() => {
      if (autoFocus && buttonRef.current && !disabled) {
        buttonRef.current.focus();
      }
    }, [autoFocus, disabled]);

    // Complex business logic: Keyboard navigation
    /**
     * BUSINESS LOGIC: Cleanup Effect
     *
     * WHY THIS EXISTS:
     * - Prevents memory leaks and cleans up resources
     *
     * WHAT IT DOES:
     * 1. Executes setFocusVisible, setFocusVisible, document.addEventListener, document.addEventListener, document.removeEventListener, document.removeEventListener functions
     * 2. Runs side effect logic
     *
     * WHAT IT CALLS:
     * - setFocusVisible() - Function call
     * - setFocusVisible() - Function call
     * - document.addEventListener() - Function call
     * - document.addEventListener() - Function call
     * - document.removeEventListener() - Function call
     * - document.removeEventListener() - Function call
     *
     * WHY IT CALLS THEM:
     * - setFocusVisible: State update
     * - setFocusVisible: State update
     * - document.addEventListener: Required functionality
     * - document.addEventListener: Required functionality
     * - document.removeEventListener: Required functionality
     * - document.removeEventListener: Required functionality
     *
     * DATA FLOW:
     * Input: Component state and props
     * Processing: Calls setFocusVisible, setFocusVisible, document.addEventListener to process data
     * Output: Side effects executed, cleanup registered
     *
     * SPECIAL BEHAVIOR:
     * - Runs only on component mount
     *
     */
    useEffect(() => {
      /**
       * BUSINESS LOGIC: handleKeyDown
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements handleKeyDown logic
       * 2. Calls helper functions: setFocusVisible
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - setFocusVisible() - Function call
       *
       * WHY IT CALLS THEM:
       * - setFocusVisible: State update
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls setFocusVisible to process data
       * Output: Computed value or side effect
       *
       */
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          setFocusVisible(true);
        }
      };

      /**
       * BUSINESS LOGIC: handleMouseDown
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements handleMouseDown logic
       * 2. Calls helper functions: setFocusVisible
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - setFocusVisible() - Function call
       *
       * WHY IT CALLS THEM:
       * - setFocusVisible: State update
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls setFocusVisible to process data
       * Output: Computed value or side effect
       *
       */
      const handleMouseDown = () => {
        setFocusVisible(false);
      };

      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleMouseDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('mousedown', handleMouseDown);
      };
    }, []);

    // Complex business logic: Analytics tracking
    /**
     * BUSINESS LOGIC: trackEvent
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Handles user interaction or event
     * 2. Calls .track, Date.now functions
     * 3. Updates state or triggers effects
     *
     * WHAT IT CALLS:
     * - .track() - Function call
     * - Date.now() - Function call
     *
     * WHY IT CALLS THEM:
     * - .track: Analytics tracking
     * - Date.now: Required functionality
     *
     * DATA FLOW:
     * Input: trackingId, variant, size state/props
     * Processing: Calls .track, Date.now to process data
     * Output: Event handled, state updated
     *
     * DEPENDENCIES:
     * - trackingId: Triggers when trackingId changes
     * - variant: Triggers when variant changes
     * - size: Triggers when size changes
     *
     * SPECIAL BEHAVIOR:
     * - Memoized for performance optimization
     *
     */
    const trackEvent = useCallback(
      (eventType: string, metadata?: Record<string, any>) => {
        if (trackingId) {
          // DAISY v1 analytics pattern - would need transformation
          window.daisy?.analytics?.track(eventType, {
            component: 'Button',
            variant,
            size,
            trackingId,
            timestamp: Date.now(),
            ...metadata,
          });
        }
      },
      [trackingId, variant, size]
    );

    // Complex business logic: Enhanced click handling
    /**
     * BUSINESS LOGIC: handleClick
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Handles user interaction or event
     * 2. Calls event.preventDefault, setIsPressed, trackEvent, Date.now, navigator.vibrate, onClick, setTimeout, setIsPressed functions
     * 3. Updates state or triggers effects
     *
     * WHAT IT CALLS:
     * - event.preventDefault() - Function call
     * - setIsPressed() - Function call
     * - trackEvent() - Function call
     * - Date.now() - Function call
     * - navigator.vibrate() - Function call
     * - onClick() - Function call
     * - setTimeout() - Function call
     * - setIsPressed() - Function call
     *
     * WHY IT CALLS THEM:
     * - event.preventDefault: Required functionality
     * - setIsPressed: State update
     * - trackEvent: Analytics tracking
     * - Date.now: Required functionality
     * - navigator.vibrate: Required functionality
     * - onClick: Required functionality
     * - setTimeout: State update
     * - setIsPressed: State update
     *
     * DATA FLOW:
     * Input: disabled, loading, onClick, children, trackEvent state/props
     * Processing: Calls event.preventDefault, setIsPressed, trackEvent to process data
     * Output: Event handled, state updated
     *
     * DEPENDENCIES:
     * - disabled: Triggers when disabled changes
     * - loading: Triggers when loading changes
     * - onClick: Triggers when onClick changes
     * - children: Triggers when children changes
     * - trackEvent: Triggers when trackEvent changes
     *
     * SPECIAL BEHAVIOR:
     * - Memoized for performance optimization
     *
     */
    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled || loading) {
          event.preventDefault();
          return;
        }

        // DAISY v1 pattern: Visual feedback
        setIsPressed(true);

        // DAISY v1 pattern: Analytics tracking
        trackEvent('button_click', {
          buttonText:
            typeof children === 'string' ? children : 'complex_content',
          timestamp: Date.now(),
        });

        // DAISY v1 pattern: Haptic feedback on mobile
        if ('vibrate' in navigator) {
          navigator.vibrate(10);
        }

        // Call user's click handler
        onClick?.(event);

        // Reset pressed state after animation
        pressTimer.current = setTimeout(() => {
          setIsPressed(false);
        }, 150);
      },
      [disabled, loading, onClick, children, trackEvent]
    );

    // Complex business logic: Tooltip management
    /**
     * BUSINESS LOGIC: handleMouseEnter
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Handles user interaction or event
     * 2. Calls setTooltipVisible, trackEvent functions
     * 3. Updates state or triggers effects
     *
     * WHAT IT CALLS:
     * - setTooltipVisible() - Function call
     * - trackEvent() - Function call
     *
     * WHY IT CALLS THEM:
     * - setTooltipVisible: State update
     * - trackEvent: Analytics tracking
     *
     * DATA FLOW:
     * Input: tooltip, disabled, trackEvent state/props
     * Processing: Calls setTooltipVisible, trackEvent to process data
     * Output: Event handled, state updated
     *
     * DEPENDENCIES:
     * - tooltip: Triggers when tooltip changes
     * - disabled: Triggers when disabled changes
     * - trackEvent: Triggers when trackEvent changes
     *
     * SPECIAL BEHAVIOR:
     * - Memoized for performance optimization
     *
     */
    const handleMouseEnter = useCallback(() => {
      if (tooltip && !disabled) {
        setTooltipVisible(true);
        trackEvent('tooltip_show');
      }
    }, [tooltip, disabled, trackEvent]);

    /**
     * BUSINESS LOGIC: handleMouseLeave
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Handles user interaction or event
     * 2. Calls setTooltipVisible, trackEvent functions
     * 3. Updates state or triggers effects
     *
     * WHAT IT CALLS:
     * - setTooltipVisible() - Function call
     * - trackEvent() - Function call
     *
     * WHY IT CALLS THEM:
     * - setTooltipVisible: State update
     * - trackEvent: Analytics tracking
     *
     * DATA FLOW:
     * Input: tooltip, trackEvent state/props
     * Processing: Calls setTooltipVisible, trackEvent to process data
     * Output: Event handled, state updated
     *
     * DEPENDENCIES:
     * - tooltip: Triggers when tooltip changes
     * - trackEvent: Triggers when trackEvent changes
     *
     * SPECIAL BEHAVIOR:
     * - Memoized for performance optimization
     *
     */
    const handleMouseLeave = useCallback(() => {
      if (tooltip) {
        setTooltipVisible(false);
        trackEvent('tooltip_hide');
      }
    }, [tooltip, trackEvent]);

    // Complex business logic: Focus management
    /**
     * BUSINESS LOGIC: handleFocus
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Handles user interaction or event
     * 2. Calls setFocusVisible, trackEvent functions
     * 3. Updates state or triggers effects
     *
     * WHAT IT CALLS:
     * - setFocusVisible() - Function call
     * - trackEvent() - Function call
     *
     * WHY IT CALLS THEM:
     * - setFocusVisible: State update
     * - trackEvent: Analytics tracking
     *
     * DATA FLOW:
     * Input: trackEvent state/props
     * Processing: Calls setFocusVisible, trackEvent to process data
     * Output: Event handled, state updated
     *
     * DEPENDENCIES:
     * - trackEvent: Triggers when trackEvent changes
     *
     * SPECIAL BEHAVIOR:
     * - Memoized for performance optimization
     *
     */
    const handleFocus = useCallback(() => {
      setFocusVisible(true);
      trackEvent('button_focus');
    }, [trackEvent]);

    /**
     * BUSINESS LOGIC: handleBlur
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Handles user interaction or event
     * 2. Calls setFocusVisible, trackEvent functions
     * 3. Updates state or triggers effects
     *
     * WHAT IT CALLS:
     * - setFocusVisible() - Function call
     * - trackEvent() - Function call
     *
     * WHY IT CALLS THEM:
     * - setFocusVisible: State update
     * - trackEvent: Analytics tracking
     *
     * DATA FLOW:
     * Input: trackEvent state/props
     * Processing: Calls setFocusVisible, trackEvent to process data
     * Output: Event handled, state updated
     *
     * DEPENDENCIES:
     * - trackEvent: Triggers when trackEvent changes
     *
     * SPECIAL BEHAVIOR:
     * - Memoized for performance optimization
     *
     */
    const handleBlur = useCallback(() => {
      setFocusVisible(false);
      trackEvent('button_blur');
    }, [trackEvent]);

    // Cleanup timers
    /**
     * BUSINESS LOGIC: Cleanup Effect
     *
     * WHY THIS EXISTS:
     * - Prevents memory leaks and cleans up resources
     *
     * WHAT IT DOES:
     * 1. Executes clearTimeout functions
     * 2. Runs side effect logic
     *
     * WHAT IT CALLS:
     * - clearTimeout() - Function call
     *
     * WHY IT CALLS THEM:
     * - clearTimeout: Required functionality
     *
     * DATA FLOW:
     * Input: Component state and props
     * Processing: Calls clearTimeout to process data
     * Output: Side effects executed, cleanup registered
     *
     * SPECIAL BEHAVIOR:
     * - Runs only on component mount
     *
     */
    useEffect(() => {
      return () => {
        if (pressTimer.current) {
          clearTimeout(pressTimer.current);
        }
      };
    }, []);

    // DAISY v1 pattern: Complex CSS class composition
    const buttonClasses = [
      'daisy-button',
      `daisy-button--${variant}`,
      `daisy-button--${size}`,
      disabled && 'daisy-button--disabled',
      loading && 'daisy-button--loading',
      isPressed && 'daisy-button--pressed',
      focusVisible && 'daisy-button--focus-visible',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // DAISY v1 pattern: Dynamic inline styles for themes
    const buttonStyles: React.CSSProperties = {
      position: 'relative',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      transform: isPressed ? 'scale(0.98)' : 'scale(1)',
      transition: 'all 0.15s ease-in-out',
    };

    return (
      <div className='relative inline-block'>
        <button
          ref={buttonRef}
          type={type}
          className={buttonClasses}
          style={buttonStyles}
          disabled={disabled || loading}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onFocus={handleFocus}
          onBlur={handleBlur}
          data-testid={testId}
          aria-label={typeof children === 'string' ? children : undefined}
          aria-disabled={disabled || loading}
          aria-describedby={
            tooltip ? `${testId || 'button'}-tooltip` : undefined
          }
          {...rest}
        >
          {/* DAISY v1 pattern: Complex loading state */}
          {loading && (
            <span
              className='inline-flex items-center justify-center w-[16px] h-[16px]'
              aria-hidden='true'
            >
              <svg viewBox='0 0 24 24' className='transition'>
                <circle
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='2'
                  fill='none'
                  strokeLinecap='round'
                  strokeDasharray='60'
                  strokeDashoffset='60'
                >
                  <animate
                    attributeName='stroke-dashoffset'
                    values='60;0;60'
                    dur='2s'
                    repeatCount='indefinite'
                  />
                </circle>
              </svg>
            </span>
          )}

          {/* Button content */}
          <span
            className={`daisy-button__content ${loading ? 'daisy-button__content--loading' : ''}`}
          >
            {children}
          </span>

          {/* DAISY v1 pattern: Custom tooltip implementation */}
          {tooltip && tooltipVisible && (
            <div
              ref={tooltipRef}
              id={`${testId || 'button'}-tooltip`}
              className=''
              role='tooltip'
              aria-hidden={!tooltipVisible}
            >
              {tooltip}
              <div className='' />
            </div>
          )}
        </button>
      </div>
    );
  }
);

// DAISY v1 pattern: Higher-order component for theme integration
/**
 * BUSINESS LOGIC: withDaisyTheme
 *
 * WHY THIS EXISTS:
 * - Implements business logic requirement
 *
 * WHAT IT DOES:
 * 1. Implements withDaisyTheme logic
 * 2. Calls helper functions: React.forwardRef, useState, useEffect, localStorage.getItem, window.matchMedia, setTheme, detectTheme, window.matchMedia, setTheme, detectTheme, mediaQuery.addEventListener, window.addEventListener, mediaQuery.removeEventListener, window.removeEventListener
 * 3. Returns computed result
 *
 * WHAT IT CALLS:
 * - React.forwardRef() - Function call
 * - useState() - Function call
 * - useEffect() - Function call
 * - localStorage.getItem() - Function call
 * - window.matchMedia() - Function call
 * - setTheme() - Function call
 * - detectTheme() - Function call
 * - window.matchMedia() - Function call
 * - setTheme() - Function call
 * - detectTheme() - Function call
 * - mediaQuery.addEventListener() - Function call
 * - window.addEventListener() - Function call
 * - mediaQuery.removeEventListener() - Function call
 * - window.removeEventListener() - Function call
 *
 * WHY IT CALLS THEM:
 * - React.forwardRef: Required functionality
 * - useState: Required functionality
 * - useEffect: Required functionality
 * - localStorage.getItem: Required functionality
 * - window.matchMedia: Required functionality
 * - setTheme: State update
 * - detectTheme: Required functionality
 * - window.matchMedia: Required functionality
 * - setTheme: State update
 * - detectTheme: Required functionality
 * - mediaQuery.addEventListener: Required functionality
 * - window.addEventListener: Required functionality
 * - mediaQuery.removeEventListener: Required functionality
 * - window.removeEventListener: Required functionality
 *
 * DATA FLOW:
 * Input: Component state and props
 * Processing: Calls React.forwardRef, useState, useEffect to process data
 * Output: Computed value or side effect
 *
 */
export const withDaisyTheme = (
  WrappedButton: React.ForwardRefExoticComponent<
    ButtonProps & React.RefAttributes<HTMLButtonElement>
  >
) => {
  return React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
    const [theme, setTheme] = useState('light');

    /**
     * BUSINESS LOGIC: Cleanup Effect
     *
     * WHY THIS EXISTS:
     * - Prevents memory leaks and cleans up resources
     *
     * WHAT IT DOES:
     * 1. Executes localStorage.getItem, window.matchMedia, setTheme, detectTheme, window.matchMedia, setTheme, detectTheme, mediaQuery.addEventListener, window.addEventListener, mediaQuery.removeEventListener, window.removeEventListener functions
     * 2. Runs side effect logic
     *
     * WHAT IT CALLS:
     * - localStorage.getItem() - Function call
     * - window.matchMedia() - Function call
     * - setTheme() - Function call
     * - detectTheme() - Function call
     * - window.matchMedia() - Function call
     * - setTheme() - Function call
     * - detectTheme() - Function call
     * - mediaQuery.addEventListener() - Function call
     * - window.addEventListener() - Function call
     * - mediaQuery.removeEventListener() - Function call
     * - window.removeEventListener() - Function call
     *
     * WHY IT CALLS THEM:
     * - localStorage.getItem: Required functionality
     * - window.matchMedia: Required functionality
     * - setTheme: State update
     * - detectTheme: Required functionality
     * - window.matchMedia: Required functionality
     * - setTheme: State update
     * - detectTheme: Required functionality
     * - mediaQuery.addEventListener: Required functionality
     * - window.addEventListener: Required functionality
     * - mediaQuery.removeEventListener: Required functionality
     * - window.removeEventListener: Required functionality
     *
     * DATA FLOW:
     * Input: Component state and props
     * Processing: Calls localStorage.getItem, window.matchMedia, setTheme to process data
     * Output: Side effects executed, cleanup registered
     *
     * SPECIAL BEHAVIOR:
     * - Runs only on component mount
     *
     */
    useEffect(() => {
      // DAISY v1 theme detection pattern
      /**
       * BUSINESS LOGIC: detectTheme
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements detectTheme logic
       * 2. Calls helper functions: localStorage.getItem, window.matchMedia
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - localStorage.getItem() - Function call
       * - window.matchMedia() - Function call
       *
       * WHY IT CALLS THEM:
       * - localStorage.getItem: Required functionality
       * - window.matchMedia: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls localStorage.getItem, window.matchMedia to process data
       * Output: Computed value or side effect
       *
       */
      const detectTheme = () => {
        const savedTheme = localStorage.getItem('daisy-theme');
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
          .matches
          ? 'dark'
          : 'light';
        return savedTheme || systemTheme;
      };

      setTheme(detectTheme());

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      /**
       * BUSINESS LOGIC: handleThemeChange
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements handleThemeChange logic
       * 2. Calls helper functions: setTheme, detectTheme
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - setTheme() - Function call
       * - detectTheme() - Function call
       *
       * WHY IT CALLS THEM:
       * - setTheme: State update
       * - detectTheme: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls setTheme, detectTheme to process data
       * Output: Computed value or side effect
       *
       */
      const handleThemeChange = () => setTheme(detectTheme());

      mediaQuery.addEventListener('change', handleThemeChange);
      window.addEventListener('storage', handleThemeChange);

      return () => {
        mediaQuery.removeEventListener('change', handleThemeChange);
        window.removeEventListener('storage', handleThemeChange);
      };
    }, []);

    return (
      <div className={`daisy-theme daisy-theme--${theme}`}>
        <WrappedButton {...props} ref={ref} />
      </div>
    );
  });
};

// Export themed version as default
export default withDaisyTheme(Button);

// DAISY v1 pattern: Component utilities and helpers
export const ButtonUtils = {
  // Theme helpers
  setTheme: (theme: 'light' | 'dark') => {
    localStorage.setItem('daisy-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  },

  // Analytics helpers
  trackButtonInteraction: (buttonId: string, action: string) => {
    window.daisy?.analytics?.track('button_interaction', {
      buttonId,
      action,
      timestamp: Date.now(),
    });
  },

  // Accessibility helpers
  announceToScreenReader: (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },
};

// DAISY v1 pattern: Global type declarations
declare global {
  interface Window {
    daisy?: {
      analytics?: {
        track: (event: string, metadata: Record<string, any>) => void;
      };
    };
  }
}
