/**
 * Public API Integration Templates
 *
 * Generates pseudo-code for Public API integration patterns per FR-003, FR-023-FR-029.
 * Implements session authentication, proxy endpoints, retry strategies, error handling, and timeouts.
 */

import type { PseudoCodeBlock } from '../../types/v2-component.js';
import type { BusinessLogicPattern, ComponentMetadata } from '../../types/ast-analysis.js';
import { generatePseudoCodeBlock, type PseudoCodeTemplate } from './pseudo-code-template.js';

/**
 * T033: Generates all API integration pseudo-code blocks
 */
export function generateAPIIntegrationPseudoCode(
  apiPatterns: BusinessLogicPattern[],
  metadata: ComponentMetadata
): PseudoCodeBlock[] {
  const blocks: PseudoCodeBlock[] = [];

  // Generate session auth block (FR-023)
  blocks.push(generateSessionAuthPseudoCode());

  // Generate proxy endpoint blocks for each API pattern (FR-024)
  apiPatterns.forEach(pattern => {
    blocks.push(generateProxyEndpointPseudoCode(pattern, metadata));
  });

  // Generate retry strategy block (FR-025)
  blocks.push(generateRetryStrategyPseudoCode());

  // Generate error handling block (FR-026)
  blocks.push(generateErrorHandlingPseudoCode());

  // Generate timeout handling block (FR-027-FR-029)
  blocks.push(generateTimeoutHandlingPseudoCode());

  return blocks;
}

/**
 * T034: Generates session authentication pseudo-code per FR-023
 */
export function generateSessionAuthPseudoCode(): PseudoCodeBlock {
  const template: PseudoCodeTemplate = {
    functionName: 'validateSession',
    purpose: 'Validates user session before API calls per FR-023',
    actions: [
      'READ session_token cookie from browser',
      'IF cookie missing THEN redirect to login page with returnUrl',
      'IF cookie expired THEN redirect to login page with returnUrl',
      'VERIFY cookie signature with session service',
      'IF signature invalid THEN redirect to login page',
      'IF session valid THEN proceed with API call',
    ],
    dataFlow: 'Cookie → Expiry check → Signature verification → Session validated',
    dependencies: ['session_token cookie', 'session service API', 'document.cookie API'],
  };

  return generatePseudoCodeBlock(template);
}

/**
 * T035: Generates proxy endpoint pseudo-code per FR-024
 */
export function generateProxyEndpointPseudoCode(
  apiPattern: BusinessLogicPattern,
  metadata: ComponentMetadata
): PseudoCodeBlock {
  // Extract operation name from pattern or component
  const operation = extractOperationName(apiPattern, metadata);
  const tenantApiName = 'DPHI'; // Default to DPHI for address lookup

  const template: PseudoCodeTemplate = {
    functionName: `call${operation}API`,
    purpose: `Calls ${tenantApiName} ${operation} via Public API proxy per FR-024`,
    actions: [
      'VALIDATE session token exists',
      'BUILD request payload: { tenantApiName, operation, parameters }',
      'SET headers: { "Content-Type": "application/json", "Cookie": session_token }',
      'POST /api/v1/proxy with payload and headers',
      'AWAIT response OR handle timeout (30s)',
      'IF response status 200 THEN parse response.data',
      'IF response status 4xx/5xx THEN throw error with status code',
      'RETURN parsed data',
    ],
    dataFlow:
      'User input → Validate → Build DPHI payload → POST /api/v1/proxy → Parse response → Return data',
    dependencies: ['/api/v1/proxy endpoint', `${tenantApiName} tenant API configuration`, 'Fetch API'],
  };

  return generatePseudoCodeBlock(template);
}

/**
 * T036: Generates retry strategy pseudo-code per FR-025
 */
export function generateRetryStrategyPseudoCode(): PseudoCodeBlock {
  const template: PseudoCodeTemplate = {
    functionName: 'retryWithBackoff',
    purpose: 'Handles APIM rate limiting with exponential backoff per FR-025',
    actions: [
      'SET retryCount = 0',
      'SET maxRetries = 3',
      'SET initialBackoff = 1000ms',
      'IF response status 429 THEN retry with backoff',
      'READ Retry-After header from response (seconds)',
      'CALCULATE backoff = Math.min(initialBackoff * 2^retryCount, Retry-After * 1000)',
      'DISPLAY countdown timer: "Rate limit reached. Retrying in {seconds}s..."',
      'SHOW cancel button during countdown',
      'AWAIT backoff duration',
      'INCREMENT retryCount',
      'IF retryCount > maxRetries THEN throw "Max retries exceeded"',
      'IF user clicks cancel THEN abort pending request',
      'RETRY API call',
    ],
    dataFlow:
      '429 response → Parse Retry-After → Calculate backoff → Display countdown → Retry OR cancel',
    dependencies: [
      'Retry-After header',
      'exponential backoff algorithm',
      'setTimeout for countdown',
      'AbortController for cancellation',
    ],
    specialBehavior:
      'Max 3 retries. Backoff starts at 1s, doubles each retry (1s → 2s → 4s). Retry-After header overrides calculated backoff. Cancel button aborts all pending retries and resets UI.',
  };

  return generatePseudoCodeBlock(template);
}

/**
 * T037: Generates error handling pseudo-code per FR-026
 */
export function generateErrorHandlingPseudoCode(): PseudoCodeBlock {
  const template: PseudoCodeTemplate = {
    functionName: 'handleAPIError',
    purpose: 'Handles HTTP status codes per FR-026',
    actions: [
      'IF status 200 THEN return response.data',
      'IF status 400 THEN display validation error from response.message',
      'IF status 401 THEN clear session and redirect to login',
      'IF status 429 THEN call retryWithBackoff strategy',
      'IF status 503 THEN display "Service temporarily unavailable. Try again in 5 minutes."',
      'IF network error (DNS/connection) THEN display "Unable to connect. Check internet connection."',
      'IF timeout error THEN display "Request timeout. Please try again."',
      'LOG error details to console for debugging',
    ],
    dataFlow:
      'HTTP response → Status check → Error handling (display/retry/redirect) OR success path',
    dependencies: ['Error response structure', 'session management', 'UI notification system'],
    specialBehavior:
      '401 errors clear session_token cookie and redirect to login. 503 errors suggest retry after 5 minutes. Network errors differentiate between DNS failures and connection timeouts.',
  };

  return generatePseudoCodeBlock(template);
}

/**
 * T038: Generates timeout handling pseudo-code per FR-027-FR-029
 */
export function generateTimeoutHandlingPseudoCode(): PseudoCodeBlock {
  const template: PseudoCodeTemplate = {
    functionName: 'handleAPITimeout',
    purpose: 'Handles slow API responses per FR-027-FR-029',
    actions: [
      'CREATE AbortController for request cancellation',
      'SET connectionTimeout = 5000ms',
      'SET readTimeout = 30000ms',
      'START API request with AbortController.signal',
      'AFTER 5s without connection: DISPLAY "Connecting..."',
      'AFTER 15s without response: DISPLAY "Request taking longer than expected. Please wait..."',
      'SHOW cancel button with message',
      'IF user clicks cancel THEN call AbortController.abort()',
      'IF abort called THEN cleanup request and reset UI',
      'IF timeout exceeds 30s THEN throw "Request timeout"',
      'IF timeout thrown THEN display retry button',
    ],
    dataFlow:
      'Request start → 5s check (connecting) → 15s check (taking longer) → 30s timeout OR response',
    dependencies: [
      'AbortController API',
      'setTimeout for timeout tracking',
      'clearTimeout for cleanup',
      'UI loading states',
    ],
    specialBehavior:
      'Cancel button sends AbortController.abort() which triggers catch block. Timeout errors show retry button. Multiple timeouts can be tracked simultaneously. Connection timeout (5s) is separate from read timeout (30s).',
  };

  return generatePseudoCodeBlock(template);
}

/**
 * Helper: Extracts operation name from API pattern or metadata
 */
function extractOperationName(pattern: BusinessLogicPattern, metadata: ComponentMetadata): string {
  // Try to extract from pattern description
  if (pattern.description) {
    const desc = pattern.description.toLowerCase();

    if (desc.includes('address')) return 'GetAddress';
    if (desc.includes('search')) return 'Search';
    if (desc.includes('lookup')) return 'Lookup';
    if (desc.includes('validate')) return 'Validate';
    if (desc.includes('fetch')) return 'Fetch';
  }

  // Try to extract from component name
  const componentName = metadata.name || 'Unknown';
  const match = componentName.match(/Get(\w+)/);
  if (match && match[1]) {
    return match[1];
  }

  // Default
  return 'Data';
}
