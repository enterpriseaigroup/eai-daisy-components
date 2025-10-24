/**
 * Analytics tracking utilities
 */

export interface ClickEvent {
  component: string;
  variant: string;
  clickCount: number;
  timestamp: number;
}

export function trackClick(event: ClickEvent): void {
  // In real app, this would send to analytics service
  console.log('Analytics event:', event);

  // Store in session for testing
  if (typeof window !== 'undefined') {
    const events = JSON.parse(
      window.sessionStorage.getItem('analytics_events') || '[]'
    );
    events.push(event);
    window.sessionStorage.setItem('analytics_events', JSON.stringify(events));
  }
}
