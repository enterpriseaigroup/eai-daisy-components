# Prototype Authentication & Authorization Flow

## Overview

This sequence diagram illustrates the end-to-end authentication and authorization flow for accessing third-party API resources (e.g., DPHI) through the Public API. The flow demonstrates a multi-layered security approach that combines user authentication via Entra (Microsoft Identity Platform) with tenant-based access control and business logic execution managed through PayloadCMS.

**Key Architectural Principle**: Public API is a lightweight RESTful gateway that handles authentication/authorization but delegates complex business logic (API credential management, third-party API orchestration) to PayloadCMS.

## System Components

- **Browser**: The user's web browser displaying the application UI
- **App Service**: The application server that delivers web pages and components (e.g., Next.js, React SSR)
- **Entra**: Microsoft's identity and access management service (formerly Azure AD)
- **Public API**: Lightweight RESTful API gateway that handles authentication/authorization but delegates business logic to PayloadCMS
- **PayloadCMS**: Content management system with business logic that:
  - Stores tenant configurations and access permissions
  - Manages encrypted API credentials per tenant
  - Executes third-party API calls on behalf of Public API
  - Maps component types (e.g., "GetAddress") to API providers (e.g., "DPHI")
- **DPHI API**: The downstream data provider API (planned for Mid-2025 integration)

## Flow Description

The flow is divided into two main phases:

### Phase 1: User Authentication (App Service orchestrates page delivery)

1. User navigates to the application in their browser
2. App Service delivers the login page/component to the browser
3. User clicks "Login" button in the browser
4. App Service initiates OAuth flow with Entra (redirects user to Entra login)
5. User sees Entra's login page and enters credentials (username and password)
6. Upon successful authentication, Entra redirects to Public API callback with auth code
7. Public API exchanges auth code with Entra for id_token, access_token, and refresh_token
8. Public API authenticates with PayloadCMS and retrieves Payload user token
9. Public API stores the Entra refresh_token on the user's profile in PayloadCMS
10. Public API redirects browser back to App Service with both Entra token and Payload token
11. App Service delivers the GetAddress page/component to the browser (with both tokens)

**Token Refresh Flow**: When the Payload token expires, Public API uses the stored refresh_token to obtain a new Entra token from Entra, then generates a new Payload token, updating both in the user session.

### Phase 2: Authorization & Resource Access (Browser component directly calls Public API)

**Important**: The App Service is NOT involved in this phase. The GetAddress component in the browser makes direct API calls.

When the user interacts with the GetAddress component (e.g., enters an address):

1. **Request Submission**: GetAddress component in browser sends POST request directly to Public API at `/get-address` with:
   - The address data in the request body
   - User's bearer token in the Authorization header (from session)
   - A hardcoded API key in the X-API-Key header identifying the tenant
   - Component type identifier (e.g., "GetAddress")

2. **Token Validation**: Public API validates the user's token with Entra
   - If invalid → returns 401 Unauthorized to browser
   - If valid → proceeds to tenant access check

3. **Tenant Access Control & API Routing**: Public API makes a RESTful call to PayloadCMS at `/execute-api-call` with:
   - User identity (from token subject/sub claim)
   - Tenant API key
   - Component type (e.g., "GetAddress" which maps to API type "DPHI")
   - Request payload (address data)

4. **PayloadCMS Business Logic Execution**:
   - Verifies user has access to the tenant
   - Validates the API key is valid for the tenant
   - Looks up the API type configuration (e.g., "DPHI") stored on the tenant
   - Retrieves encrypted DPHI API credentials from tenant configuration
   - Makes the actual call to DPHI API with the credentials and address data
   - Returns the DPHI response to Public API
   - If not authorized → returns 403 Forbidden

5. **Response**: Public API passes the result back to the browser component

## Security Features

- **Two-factor verification**: Both user identity (via Entra token) and tenant membership (via PayloadCMS) must be validated
- **Encrypted credentials**: DPHI API credentials are stored encrypted in PayloadCMS
- **Token-based authentication**: Short-lived bearer tokens prevent unauthorized access
- **API key validation**: Additional layer of access control per tenant
- **Secure token storage**: Entra refresh tokens are stored securely in PayloadCMS on user profiles
- **Token refresh mechanism**: Automatic token refresh using stored refresh_token when Payload token expires

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
  AppService->>Browser: 302 Redirect to Entra /authorize
  Browser->>Entra: GET /authorize (OAuth flow starts)
  Note right of Entra: User sees login form
  Browser->>Entra: POST /login (username + password)
  Entra-->>Browser: 302 Redirect to Public API callback
  Browser->>PublicAPI: GET /auth/callback?code=...

  Note right of PublicAPI: Public API handles callback
  PublicAPI->>Entra: POST /token (exchange code for tokens)
  Entra-->>PublicAPI: 200 OK (id_token, access_token, refresh_token)

  PublicAPI->>Payload: POST /auth/login (authenticate, get Payload token)
  Payload-->>PublicAPI: 200 OK (payload_user_token)

  Note right of PublicAPI: Store refresh_token on user profile
  PublicAPI->>Payload: PATCH /users/{userId} (store refresh_token)
  Payload-->>PublicAPI: 200 OK (refresh_token stored)

  PublicAPI-->>Browser: 302 Redirect to App Service + tokens in query/cookie
  Browser->>AppService: GET /dashboard?tokens=...
  AppService-->>Browser: 200 OK + Deliver GetAddress page (with both tokens)

  Note over Browser,DPHI: PHASE 2: Component API Calls (App Service not involved)
  Browser->>PublicAPI: POST /get-address
    note right of Browser: GetAddress component makes direct call<br/>body: { address, componentType: "GetAddress" }<br/>headers: Authorization: Bearer <entraToken>,<br/>X-Payload-Token: <payloadToken>,<br/>X-API-Key: <hardcoded>

  Note right of PublicAPI: Step 1: validate user token with Entra
  PublicAPI->>Entra: Validate token / introspect
  Entra-->>PublicAPI: Token valid (claims) / or invalid

  alt token invalid or expired
    Note right of PublicAPI: Token refresh flow
    PublicAPI->>Payload: GET /users/{userId} (retrieve refresh_token)
    Payload-->>PublicAPI: 200 OK (refresh_token)
    PublicAPI->>Entra: POST /token (refresh=true, refresh_token)
    Entra-->>PublicAPI: 200 OK (new id_token, access_token)
    PublicAPI->>Payload: POST /auth/refresh (get new Payload token)
    Payload-->>PublicAPI: 200 OK (new payload_user_token)
    PublicAPI-->>Browser: 401 + New tokens (client retries with new tokens)
  else token valid
    Note right of PublicAPI: Step 2: Delegate to PayloadCMS for business logic
    PublicAPI->>Payload: POST /execute-api-call
      note right of PublicAPI: body: {<br/>  user: <sub>,<br/>  apiKey: X-API-Key,<br/>  componentType: "GetAddress",<br/>  payload: { address }<br/>}

    Note right of Payload: PayloadCMS executes business logic
    alt user has tenant access
      Note right of Payload: 1. Verify user access to tenant<br/>2. Validate API key<br/>3. Lookup API type "DPHI" from componentType<br/>4. Retrieve encrypted DPHI credentials<br/>5. Call DPHI API
      Payload->>DPHI: POST /GetAddress (DPHI creds + address)  %% Mid2025
      DPHI-->>Payload: 200 OK (address result)
      Payload-->>PublicAPI: 200 OK (address result from DPHI)
      PublicAPI-->>Browser: 200 OK (address result)
    else user not authorized for tenant
      Payload-->>PublicAPI: 403 Forbidden
      PublicAPI-->>Browser: 403 Forbidden (access denied)
    end
  end
```
