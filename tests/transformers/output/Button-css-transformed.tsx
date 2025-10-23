/**
 * MIGRATED: CSS imports removed, replaced with Tailwind classes
 * CONVERSION: Automated by CSS-to-Tailwind transformer
 * DATE: 2025-10-22
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';

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
    useEffect(() => {
      if (autoFocus && buttonRef.current && !disabled) {
        buttonRef.current.focus();
      }
    }, [autoFocus, disabled]);

    // Complex business logic: Keyboard navigation
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          setFocusVisible(true);
        }
      };

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
    const handleMouseEnter = useCallback(() => {
      if (tooltip && !disabled) {
        setTooltipVisible(true);
        trackEvent('tooltip_show');
      }
    }, [tooltip, disabled, trackEvent]);

    const handleMouseLeave = useCallback(() => {
      if (tooltip) {
        setTooltipVisible(false);
        trackEvent('tooltip_hide');
      }
    }, [tooltip, trackEvent]);

    // Complex business logic: Focus management
    const handleFocus = useCallback(() => {
      setFocusVisible(true);
      trackEvent('button_focus');
    }, [trackEvent]);

    const handleBlur = useCallback(() => {
      setFocusVisible(false);
      trackEvent('button_blur');
    }, [trackEvent]);

    // Cleanup timers
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
      <div className="relative inline-block">
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
            <span className="inline-flex items-center justify-center w-[16px] h-[16px]" aria-hidden='true'>
              <svg viewBox='0 0 24 24' className="transition">
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
              className=""
              role='tooltip'
              aria-hidden={!tooltipVisible}
            >
              {tooltip}
              <div className="" />
            </div>
          )}
        </button>
      </div>
    );
  }
);

// DAISY v1 pattern: Higher-order component for theme integration
export const withDaisyTheme = (
  WrappedButton: React.ForwardRefExoticComponent<
    ButtonProps & React.RefAttributes<HTMLButtonElement>
  >
) => {
  return React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
      // DAISY v1 theme detection pattern
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
