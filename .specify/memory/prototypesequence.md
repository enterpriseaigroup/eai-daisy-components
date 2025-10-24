# Prototype Authentication & Authorization Flow

## Overview

This sequence diagram illustrates the end-to-end authentication and authorization flow for accessing DPHI API resources through the Public API. The flow demonstrates a multi-layered security approach that combines user authentication via Entra (Microsoft Identity Platform) with tenant-based access control managed through PayloadCMS.

## System Components

- **Browser**: The user's web browser displaying the application UI
- **App Service**: The application server that delivers web pages and components (e.g., Next.js, React SSR)
- **Entra**: Microsoft's identity and access management service (formerly Azure AD)
- **Public API**: The backend API gateway that orchestrates authentication and authorization
- **PayloadCMS**: Content management system that stores tenant configurations and access permissions
- **DPHI API**: The downstream data provider API (planned for Mid-2025 integration)

## Flow Description

The flow is divided into two main phases:

### Phase 1: User Authentication (App Service orchestrates page delivery)

1. User navigates to the application in their browser
2. App Service delivers the login page/component to the browser
3. User clicks "Login" button in the browser
4. App Service initiates OAuth flow with Entra (redirects user to Entra login)
5. User sees Entra's login page and enters credentials (username and password)
6. Upon successful authentication, Entra redirects back to App Service with auth code/token
7. App Service processes the OAuth callback and establishes a user session
8. App Service delivers the GetAddress page/component to the browser (with user session cookie/token)

### Phase 2: Authorization & Resource Access (Browser component directly calls Public API)

**Important**: The App Service is NOT involved in this phase. The GetAddress component in the browser makes direct API calls.

When the user interacts with the GetAddress component (e.g., enters an address):

1. **Request Submission**: GetAddress component in browser sends POST request directly to Public API at `/request-dphi-creds` with:
   - The address data in the request body
   - User's bearer token in the Authorization header (from session)
   - A hardcoded API key in the X-API-Key header

2. **Token Validation**: Public API validates the user's token with Entra
   - If invalid → returns 401 Unauthorized to browser
   - If valid → proceeds to tenant access check

3. **Tenant Access Control**: Public API checks with PayloadCMS to verify:
   - The user (identified by token subject/sub claim) has access to the tenant
   - The provided API key is valid for the tenant

4. **DPHI Credential Management**:
   - If authorized → PayloadCMS returns encrypted DPHI credentials
   - Public API uses these credentials to call DPHI's GetAddress endpoint
   - Results are returned directly to the browser component
   - If not authorized → returns 403 Forbidden to browser

## Security Features

- **Two-factor verification**: Both user identity (via Entra token) and tenant membership (via PayloadCMS) must be validated
- **Encrypted credentials**: DPHI API credentials are stored encrypted in PayloadCMS
- **Token-based authentication**: Short-lived bearer tokens prevent unauthorized access
- **API key validation**: Additional layer of access control per tenant

## Implementation Timeline

The DPHI API integration is planned for Mid-2025 (as noted in the diagram).

```mermaid
sequenceDiagram
  participant Browser as "Browser"
  participant AppService as "App Service"
  participant Entra as "Entra"
  participant PublicAPI as "Public API"
  participant Payload as "PayloadCMS"
  participant DPHI as "DPHI API"

  Note over Browser,AppService: PHASE 1: Authentication & Page Delivery
  Browser->>AppService: Navigate to app / Click "Login"
  AppService->>Entra: 302 Redirect to /authorize (OAuth flow)
  Browser->>Entra: GET /authorize (user sees login form)
  Browser->>Entra: POST /login (username + password)
  Entra-->>Browser: 302 Redirect to App Service callback
  Browser->>AppService: GET /auth/callback?code=...
  AppService->>Entra: POST /token (exchange code for tokens)
  Entra-->>AppService: 200 OK (id_token, access_token)
  AppService-->>Browser: 200 OK + Set session cookie + Deliver GetAddress page

  Note over Browser,DPHI: PHASE 2: Component API Calls (App Service not involved)
  Browser->>PublicAPI: POST /request-dphi-creds
    note right of Browser: GetAddress component makes direct call<br/>body: { address }<br/>headers: Authorization: Bearer <userToken>,<br/>X-API-Key: <hardcoded>

  Note right of PublicAPI: Step 1: validate user token with Entra
  PublicAPI->>Entra: Validate token / introspect
  Entra-->>PublicAPI: Token valid (claims) / or invalid

  alt token invalid
    PublicAPI-->>Browser: 401 Unauthorized
  else token valid
    Note right of PublicAPI: Step 2: check tenant/API-key access in PayloadCMS
    PublicAPI->>Payload: GET /tenants/{tenantId}/access?apiKey=X-API-Key&user=<sub>
    alt user has tenant access
      Payload-->>PublicAPI: 200 OK -> tenant allowed, return DPHI creds (encrypted)
      PublicAPI->>DPHI: POST /GetAddress (use returned DPHI creds + address)  %% Mid2025
      DPHI-->>PublicAPI: 200 OK (address result)
      PublicAPI-->>Browser: 200 OK (address result)
    else user not authorized for tenant
      Payload-->>PublicAPI: 403 Forbidden
      PublicAPI-->>Browser: 403 Forbidden (access denied)
    end
  end
```
