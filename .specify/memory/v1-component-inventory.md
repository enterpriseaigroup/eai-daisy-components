# DAISY V1 Component Inventory

**Document Type**: SpecKit Memory - Component Reference  
**Created**: October 21, 2025  
**Last Updated**: October 21, 2025 (Post-Audit)  
**Purpose**: Comprehensive inventory of DAISY V1 components for MVP extraction and future migration  
**Source**: DAISY-main/src/app/(presentation)/components/  
**Authority**: GitHub SpecKit `.specify/memory/` - Reference Documentation

---

## Document Purpose

This inventory documents ALL components in DAISY V1 (DAISY-main) to support:

1. **MVP Sprint Planning** (Weeks 1-4): Extract 3 embeddable components
2. **Phase 1 Planning** (Weeks 5-14): Migrate remaining screens to PayloadCMS
3. **Production Readiness**: Complete feature parity checklist

**AUDIT UPDATE**: Post-audit findings added missing components and infrastructure patterns.
**Total Components**: 47 (vs 42 originally documented)
**Complexity Rating**: Upgraded from Medium to High based on audit findings

---

## 🎯 MVP Components (Selected for 4-Week Sprint)

### Component 1: GetAddressCard ✅ **US1 - Property Address Lookup**

**Location**: `DAISY-main/src/app/(presentation)/components/chatbot/cards/GetAddressCard.tsx`  
**Size**: 966 lines  
**Complexity**: HIGH

#### Functionality
- Address autocomplete with as-you-type suggestions
- Lot/DP number search (alternate lookup method)
- Property restrictions checking (bushfire, flood, heritage)
- Zoning information display (zone codes + descriptions)
- Property report link generation
- Lot width calculation
- Precinct lookup (active planning precincts)
- Battle-axe lot detection
- Corner lot detection

#### API Dependencies (Mid2025-dev)
- `POST /property/lookup` - Property details by address
- `GET /property/autocomplete` - Address suggestions
- `POST /property/lot-width` - Lot dimensions
- `POST /property/precinct` - Precinct information

#### Key Interfaces
```typescript
interface AddressOption {
  address: string;
  propId: string;
  GURASID: string;
}

interface PropertyCheckResult {
  council_id?: string;
  council_name?: string;
  lot_size?: string;
  zone?: string;
  zone_description?: string;
  bushfire_restrictions?: boolean;
  flood_restrictions?: boolean;
  heritage_restrictions?: boolean;
  property_report_url?: string;
}
```

#### Sub-Components to Extract
1. **AddressInput.tsx** - Autocomplete input with suggestions dropdown
2. **LotDPInput.tsx** - Lot/DP number validation and search
3. **RestrictionsDisplay.tsx** - Bushfire/flood/heritage warnings
4. **ZoningInfo.tsx** - Zone code and description display

#### Testing Requirements
- E2E: Real address lookup via Mid2025-dev
- E2E: Autocomplete suggestions
- Integration: Address validation regex
- Integration: Lot/DP format validation
- Unit: Restriction logic (bushfire only, flood+heritage, etc.)

---

### Component 2: Daisy Chatbot ✅ **US1b - Q&A Chatbot**

**Location**: `DAISY-main/src/app/(presentation)/components/chatbot/Daisy.tsx`  
**Size**: 1056 lines  
**Complexity**: HIGH

#### Functionality
- Message input and display
- Streaming AI responses
- Conversation history management
- Typing indicators
- Suggestion boxes (quick replies)
- Follow-up question prompts
- HTML message rendering (safe sanitization)
- WebSocket integration for real-time updates
- Conversation state persistence

#### API Dependencies (Mid2025-dev)
- `POST /chat/message` - Send user message, get AI response
- `POST /chat/stream` - Streaming response endpoint (if used)
- `GET /chat/history` - Retrieve conversation history
- `POST /chat/feedback` - User feedback on responses

#### Key Interfaces
```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  message_type?: string;
  metadata?: Record<string, unknown>;
}

interface Conversation {
  id: string;
  messages: ChatMessage[];
  user_id: string;
  created_at: Date;
  updated_at: Date;
}
```

#### Sub-Components to Extract
1. **MessageInput.tsx** - Text input with send button
2. **MessageList.tsx** - Scrollable message history
3. **TypingIndicator.tsx** - Animated "..." indicator
4. **SuggestionBox.tsx** - Quick reply buttons
5. **MessageBubble.tsx** - Individual message display

#### Testing Requirements
- E2E: Send message and receive AI response
- E2E: Suggestion box click flow
- Integration: Message display rendering
- Integration: Conversation persistence
- Unit: HTML sanitization
- Unit: Message timestamp formatting

---

### Component 3: BusinessRequestStatus ⚠️ **US1c - Application Status Tracker**

**Location**: NEW COMPONENT (no DAISY V1 equivalent)  
**Size**: TBD (estimated 300-400 lines)  
**Complexity**: MEDIUM

#### Functionality
- Display application/business request status
- Status timeline visualization
- Status badge (Draft, Submitted, Under Review, Approved, Rejected)
- Document submission tracking
- Council feedback display
- Next steps recommendations

#### API Dependencies (PayloadCMS Configurator)
- `GET /api/public/v1/business-requests/:id` - Get request by ID
- `GET /api/public/v1/business-requests/:id/timeline` - Status history
- `GET /api/public/v1/business-requests/:id/documents` - Attached documents

#### Key Interfaces
```typescript
interface BusinessRequest {
  id: string;
  tenant_id: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  application_name: string;
  address: string;
  submitted_at?: Date;
  updated_at: Date;
  council_feedback?: string;
}

interface StatusUpdate {
  id: string;
  status: string;
  timestamp: Date;
  note?: string;
  actor?: string; // Who made the change
}
```

#### Sub-Components to Create
1. **StatusTimeline.tsx** - Vertical timeline with status changes
2. **StatusBadge.tsx** - Colored badge (Draft=gray, Submitted=blue, etc.)
3. **NotFound.tsx** - Error state when request ID not found
4. **NextSteps.tsx** - Recommended actions based on status

#### Testing Requirements
- E2E: Load business request by ID
- E2E: Display timeline with multiple status changes
- Integration: Status badge color logic
- Unit: Status text formatting
- Unit: Timeline sorting (newest first)

---

## 📊 Dashboard Components (Phase 1 Migration Candidates)

### Stage Management System

#### StageManager.tsx
**Location**: `components/dashboard/StageManager.tsx`  
**Size**: 85 lines  
**Purpose**: Orchestrates 4-stage workflow (Property → Project → Documents → Application)

**Migration Path**: PayloadCMS block system
- Stage state stored in BusinessRequests collection (`current_stage` field)
- Stage transitions trigger workflow hooks
- Clarity analytics integration for stage tracking

#### StageContent.tsx
**Location**: `components/dashboard/StageContent.tsx`  
**Size**: 272 lines  
**Purpose**: Renders content for current stage

**Migration Path**: PayloadCMS page routing
- Each stage becomes a route (`/application/:id/property`, `/application/:id/planning`, etc.)
- Components rendered as PayloadCMS blocks
- Mobile/desktop responsive layout handling

#### StageProgress.tsx
**Location**: `components/dashboard/StageProgress.tsx`  
**Size**: TBD  
**Purpose**: Visual progress indicator (stepper)

**Migration Path**: Reusable block component
- Could be embeddable component in Phase 2
- Used in both PayloadCMS admin and external embeds

---

### Property Information Display

#### PropertyInfoCard.tsx
**Location**: `components/LeftColumn/PropertyInfoCard.tsx`  
**Size**: TBD  
**Purpose**: Shows address, zoning, restrictions in left sidebar

**Migration Path**: PayloadCMS block
- Queries Properties collection
- Displays cached property data
- Links to property report modal

#### DevelopmentSummaryCard.tsx
**Location**: `components/LeftColumn/DevelopmentSummaryCard.tsx`  
**Size**: TBD  
**Purpose**: Shows project summary (application name, type, status)

**Migration Path**: PayloadCMS block
- Queries BusinessRequests collection
- Displays application metadata
- Editable fields link to edit forms

---

## 🏘️ Planning Pathway Components (Phase 1 Priority)

### MatchedRows.tsx
**Location**: `components/planning/MatchedRows.tsx`  
**Size**: 150+ lines  
**Purpose**: Displays DA/CDC/Exempt pathway options

**Functionality**:
- Shows 3 planning pathway cards
- Radio button selection
- Pathway descriptions (DA, CDC, Exempt)
- Conditional rendering based on property eligibility

**Migration Path**: High priority for Phase 1
- Equivalent to US2 "Pathway Recommendation" feature
- Could be embeddable component alternative to BusinessRequestStatus
- Uses AI-driven pathway matching logic

**API Dependencies**:
- `POST /planning/pathway-match` - Get eligible pathways for property
- Uses property restrictions + project description to determine pathways

### MatchedRowCard.tsx
**Location**: `components/planning/MatchedRowCard.tsx`  
**Size**: TBD  
**Purpose**: Individual pathway card with radio button

**Migration Path**: Reusable block component

### ClearPlanningPathways.tsx
**Location**: `components/planning/ClearPlanningPathways.tsx`  
**Size**: ~40 lines  
**Purpose**: Reset button to clear pathway selection

**Migration Path**: Simple button component, can be inline

### StaticDocumentChecklist.tsx
**Location**: `components/planning/StaticDocumentChecklist.tsx`  
**Size**: TBD  
**Purpose**: Displays document requirements for selected pathway

**Migration Path**: Phase 1 priority
- Links to Documents collection
- Generates personalized checklist based on pathway + property

---

## 📄 Document Management Components (Phase 1 Critical)

### DocumentChecklistPanel.tsx
**Location**: `components/MiddleColumn/DocumentChecklistPanel.tsx`  
**Size**: TBD  
**Purpose**: Main document requirements checklist

**Functionality**:
- Lists required documents for application type
- Shows completion status (✅ uploaded, ⚠️ pending)
- Document upload buttons
- Validation status indicators

**Migration Path**: CRITICAL for Phase 1
- Maps to Documents collection in Configurator
- Personalized checklist based on TenantSettings blocks
- Document upload via PayloadCMS media handling

**API Dependencies**:
- `GET /documents/checklist/:business-request-id` - Get required docs
- `POST /documents/upload` - Upload document
- `GET /documents/:id/validation` - AI validation status

### DocumentTable.tsx
**Location**: `components/MiddleColumn/DocumentTable.tsx`  
**Size**: TBD  
**Purpose**: Table view of uploaded documents

**Migration Path**: PayloadCMS relationship field UI
- Documents collection with file upload
- Metadata fields (document_type, validation_status, etc.)

### DocumentDownloadPanel.tsx
**Location**: `components/DownloadDocuments/DocumentDownloadPanel.tsx`  
**Size**: TBD  
**Purpose**: Bulk document download and export

**Migration Path**: Phase 1 feature
- ZIP generation of all documents
- Export to council portal format

---

## 🏛️ Submission Components (Phase 1 Final Stage)

### CouncilSubmissionCards.tsx
**Location**: `components/councilSubmissionCards/CouncilSubmissionCards.tsx`  
**Size**: TBD  
**Purpose**: Council-specific submission cards

**Functionality**:
- Council portal links
- Submission instructions
- Pre-fill form data generation
- Payment information

**Migration Path**: Phase 1 finale
- TenantSettings block for council submission config
- Redirect to council portal with pre-filled data
- Audit logging of submission events

---

## 🎨 Layout & Navigation (Phase 1 Foundation)

### Header.tsx
**Location**: `components/Headers/Header/Header.tsx`  
**Size**: TBD  
**Purpose**: Main navigation header

**Functionality**:
- User menu (profile, logout)
- Council switcher
- Application name display
- Mobile hamburger menu

**Migration Path**: PayloadCMS Admin UI override
- Custom header component
- Integrates with PayloadCMS auth
- Tenant context display

### PropertyReportModal.tsx
**Location**: `components/dashboard/PropertyReportModal.tsx`  
**Size**: TBD  
**Purpose**: Modal for viewing property reports

**Migration Path**: Reusable modal component
- Iframe embed of property report URL
- Can be used in both admin and embeds

---

## 💬 Additional Chatbot Cards (Phase 1 or Phase 2)

### GetEmailCard.tsx
**Location**: `components/chatbot/cards/GetEmailCard.tsx`  
**Size**: TBD  
**Purpose**: Email collection within chat flow

**Migration Path**: Phase 1 or embeddable
- Email validation
- User profile creation
- Newsletter opt-in

### GetStartedCard.tsx
**Location**: `components/chatbot/cards/GetStartedCard.tsx`  
**Size**: TBD  
**Purpose**: Initial welcome card in chatbot

**Migration Path**: Phase 1 or embeddable
- Project creation flow
- Address entry prompt

### SuggestionBox.tsx
**Location**: `components/chatbot/cards/SuggestionBox.tsx`  
**Size**: TBD  
**Purpose**: Quick reply suggestion buttons

**Migration Path**: Part of QAChatbot embeddable
- Dynamic suggestions based on context
- Click-to-send functionality

### FollowUpSuggestionBox.tsx
**Location**: `components/chatbot/cards/FollowUpSuggestionBox.tsx`  
**Size**: TBD  
**Purpose**: Follow-up question suggestions

**Migration Path**: Part of QAChatbot embeddable

---

## 🔧 Utility Components (Reusable Library)

### LoginLoader.tsx
**Location**: `components/loader/LoginLoader.tsx`  
**Size**: Small  
**Purpose**: Authentication loading screen

**Migration Path**: Shared utility component
- Used during MSAL authentication
- PayloadCMS auth loading state

### ErrorBoundary.tsx
**Location**: `components/ErrorBoundary.tsx`  
**Size**: Small  
**Purpose**: React error boundary

**Migration Path**: Wrap all PayloadCMS custom components

### SystemAlertBanner.tsx
**Location**: `components/SystemAlertBanner.tsx`  
**Size**: Small  
**Purpose**: System-wide notification banner

**Migration Path**: PayloadCMS notification system integration

---

## 📋 Migration Roadmap Checklist

### ✅ MVP (Weeks 1-4): Embeddable Components

- [x] **US1**: GetAddressCard extraction (966 lines)
  - [ ] Address autocomplete API endpoint
  - [ ] Property lookup API endpoint
  - [ ] Restrictions display logic
  - [ ] Storybook documentation
  - [ ] npm package publishing

- [x] **US1b**: QAChatbot extraction (1056 lines)
  - [ ] Chat message API endpoint
  - [ ] Streaming response handling
  - [ ] Conversation persistence
  - [ ] Storybook documentation
  - [ ] npm package publishing

- [x] **US1c**: BusinessRequestStatus creation (NEW)
  - [ ] Status timeline API endpoint
  - [ ] Status badge component
  - [ ] Timeline visualization
  - [ ] Storybook documentation
  - [ ] npm package publishing

- [ ] **US2**: API key management (PayloadCMS admin)
- [ ] **US3**: Property caching (MongoDB collection)
- [ ] **Demo Website**: All 3 components showcased
- [ ] **Azure Deployment**: Dev environment
- [ ] **npm Publishing**: @daisy/embeddable-ui@1.0.0

### 🚧 Phase 1 (Weeks 5-14): Screen Migration

#### Weeks 5-7: Stage Components
- [ ] PropertyStage → PayloadCMS route (orientation screen)
- [ ] PlanningStage → PayloadCMS route
  - [ ] MatchedRows component migration
  - [ ] Pathway selection logic
  - [ ] AI pathway recommendation
- [ ] DocumentStage → PayloadCMS route
  - [ ] DocumentChecklistPanel migration
  - [ ] DocumentTable migration
  - [ ] Upload functionality
- [ ] SubmissionStage → PayloadCMS route
  - [ ] CouncilSubmissionCards migration

#### Weeks 8-10: Dashboard Infrastructure
- [ ] StageManager → PayloadCMS workflow
- [ ] StageProgress → Embeddable component (optional)
- [ ] StageContent → PayloadCMS routing logic
- [ ] PropertyInfoCard → PayloadCMS block
- [ ] DevelopmentSummaryCard → PayloadCMS block

#### Weeks 11-12: Document Management
- [ ] Document upload to PayloadCMS Media
- [ ] Document validation integration (AI)
- [ ] Document checklist personalization
- [ ] Bulk download/export (ZIP generation)

#### Weeks 13-14: Final Polish
- [ ] Header navigation in PayloadCMS admin
- [ ] PropertyReportModal integration
- [ ] Error handling and loading states
- [ ] Mobile responsive layouts
- [ ] E2E testing suite

### 🎯 Phase 2 (Weeks 15+): Production Readiness

#### Additional Embeddable Components
- [ ] StageProgress widget (optional)
- [ ] DocumentChecklist widget (optional)
- [ ] MatchedRows widget (pathway selector)
- [ ] GetEmailCard widget (lead capture)

#### Advanced Features
- [ ] AI document validation
- [ ] Automated document generation
- [ ] Council portal integration (webhooks)
- [ ] Payment processing
- [ ] Application status notifications (email/SMS)

#### Scale & Performance
- [ ] Load testing (1000+ concurrent users)
- [ ] CDN for embeddable components
- [ ] Redis caching layer
- [ ] Database query optimization
- [ ] Application Insights monitoring

---

## 🔍 Component Complexity Analysis

### High Complexity (1000+ lines, multiple dependencies)
1. **GetAddressCard** (966 lines) - Address lookup, autocomplete, restrictions
2. **Daisy Chatbot** (1056 lines) - Chat UI, streaming, conversation state

### Medium Complexity (300-600 lines, moderate dependencies)
3. **StageContent** (272 lines) - Stage orchestration, responsive layouts
4. **MatchedRows** (150+ lines) - Pathway selection, conditional rendering
5. **DocumentChecklistPanel** (TBD) - Checklist logic, upload handling
6. **BusinessRequestStatus** (NEW, 300-400 lines) - Timeline, status tracking

### Low Complexity (<200 lines, simple UI)
7. **PropertyInfoCard** - Display property data
8. **DevelopmentSummaryCard** - Display application summary
9. **StageProgress** - Progress indicator UI
10. **MatchedRowCard** - Individual pathway card
11. **DocumentTable** - Table display
12. **PropertyReportModal** - Modal wrapper
13. **Header** - Navigation bar
14. All utility components (loader, error boundary, etc.)

---

## 📊 API Endpoint Inventory

### Mid2025-dev Backend (Existing, Keep Operational)

**Property Endpoints**:
- `POST /property/lookup` - Get property details by address/prop_id
- `GET /property/autocomplete` - Address suggestions
- `POST /property/lot-width` - Lot dimensions
- `POST /property/precinct` - Precinct information
- `GET /property/report` - Property report URL

**Chat Endpoints**:
- `POST /chat/message` - Send message, get AI response
- `GET /chat/history` - Conversation history
- `POST /chat/feedback` - User feedback

**Planning Endpoints**:
- `POST /planning/pathway-match` - Get eligible pathways
- `GET /planning/pathways` - List all pathway types
- `POST /planning/checklist` - Generate document checklist

**Document Endpoints**:
- `POST /documents/validate` - AI document validation
- `POST /documents/extract` - Extract metadata from document
- `GET /documents/requirements` - Get required documents for pathway

### PayloadCMS Configurator (New Public API)

**Embeddable Components API**:
- `GET /api/public/v1/property/autocomplete` - Address suggestions (proxy to Mid2025)
- `POST /api/public/v1/property/lookup` - Property details (proxy to Mid2025)
- `POST /api/public/v1/chat/message` - Chat message (proxy to Mid2025)
- `GET /api/public/v1/business-requests/:id` - Application status
- `GET /api/public/v1/business-requests/:id/timeline` - Status history

**Admin API**:
- `POST /api/tenants/:id/api-keys` - Generate API key
- `DELETE /api/api-keys/:id` - Revoke API key
- `GET /api/cache/stats` - Cache statistics

---

## 🔍 **POST-AUDIT ADDITIONS** - Missing Components Discovered

### Critical Infrastructure Components (Not Previously Documented)

#### PropertyReportModal.tsx
**Location**: `DAISY-main/src/app/(presentation)/components/dashboard/PropertyReportModal.tsx`  
**Purpose**: PDF document viewer with Azure blob integration  
**Complexity**: MEDIUM  
**Migration Priority**: Phase 1 (Week 8-9)

#### SystemAlertBanner.tsx  
**Location**: `DAISY-main/src/app/(presentation)/components/SystemAlertBanner.tsx`  
**Purpose**: Global notification system for system-wide alerts  
**Complexity**: LOW  
**Migration Priority**: Phase 1 (Week 6)

#### CouncilSubmissionCards.tsx
**Location**: `DAISY-main/src/app/(presentation)/components/councilSubmissionCards/CouncilSubmissionCards.tsx`  
**Purpose**: Council-specific submission workflows and forms  
**Complexity**: MEDIUM  
**Migration Priority**: Phase 1 (Week 9-10)

#### MapBox.tsx
**Location**: `DAISY-main/src/app/(presentation)/components/mapbox/MapBox.tsx`  
**Purpose**: Interactive mapping component for property visualization  
**Complexity**: HIGH (External API integration)  
**Migration Priority**: Phase 1 (Week 11-12)

#### LoginLoader.tsx
**Location**: `DAISY-main/src/app/(presentation)/components/loader/LoginLoader.tsx`  
**Purpose**: Authentication loading states and MSAL integration  
**Complexity**: MEDIUM  
**Migration Priority**: Phase 1 (Week 5-6, with authentication migration)

### Critical Infrastructure Patterns (Not Previously Documented)

#### Dependency Injection System
**Location**: `DAISY-main/src/app/(infrastructure)/di.ts`  
**Purpose**: Service resolution and dependency management  
**Pattern**: Container-based service registration and resolution  
**Migration Impact**: HIGH - Must establish equivalent in PayloadCMS context

#### Custom Middleware Stack
**Location**: `DAISY-main/src/middleware.ts` + `DAISY-main/src/middleware/`  
**Components**:
- `withAuth.ts` - Authentication middleware
- `withCorrelationId.ts` - Request tracing middleware
**Migration Impact**: HIGH - Complex CSP, auth, and security patterns

#### Multi-Store State Management
**Location**: `DAISY-main/src/app/(presentation)/store/`  
**Stores**:
- `useProfileStore.ts` (500+ lines) - User profile and project data
- `useAuthStore.ts` (300+ lines) - MSAL authentication state
- `useApiStatusStore.ts` - API health monitoring
- `uploadStatusStore.ts` - File upload progress
**Migration Impact**: EXTREMELY HIGH - Complex state synchronization patterns

#### WebSocket Integration
**Location**: `DAISY-main/src/app/(infrastructure)/api/daisy/general/v1/websocket/`  
**Purpose**: Real-time document validation and live updates  
**Migration Impact**: HIGH - Requires WebSocket infrastructure in V2

#### Advanced Error Handling System
**Components**:
- `ErrorBoundary.tsx` - React error boundaries
- `IsRedirectError.ts` - MSAL redirect detection
- `BaseApiService.ts` - HTTP error handling with retry logic
- `handleApiError.ts` - Centralized error processing
**Migration Impact**: HIGH - Sophisticated error recovery patterns

#### Comprehensive Testing Infrastructure
**Components**:
- **Jest**: 95+ unit test files across components, hooks, services
- **Playwright**: 5+ E2E test suites with authentication flows
- **Storybook**: Component documentation with visual regression
- **Mock Infrastructure**: MSW, Mock WebPubSub, JSON Server
**Migration Impact**: EXTREMELY HIGH - Entire test suite needs V2 migration

### Updated Component Count
**ORIGINAL INVENTORY**: 42 components  
**POST-AUDIT TOTAL**: 47 components  
**INFRASTRUCTURE PATTERNS**: 6 critical systems not previously documented  
**TESTING INFRASTRUCTURE**: 95+ test files requiring migration

### Risk Assessment Update
**ORIGINAL ASSESSMENT**: Medium complexity, 12-16 weeks  
**REVISED ASSESSMENT**: High complexity, 20-24 weeks  

**Primary Risk Factors**:
1. **Authentication Migration**: MSAL→PayloadCMS complexity (5x underestimated)
2. **State Management**: Multi-store architecture migration (4x underestimated)  
3. **Testing Migration**: 95+ test files not originally planned
4. **Infrastructure Patterns**: 6 critical systems not documented
5. **Component Complexity**: GetAddressCard (966 lines) and QAChatbot (1000+ lines) far more complex than estimated

---

## 🎓 Learning Notes for Future Sprints

### Component Extraction Patterns
1. **Identify core functionality** - What does the component DO?
2. **Map API dependencies** - What endpoints does it call?
3. **Define TypeScript interfaces** - What data structures?
4. **Extract sub-components** - What are the logical pieces?
5. **Document props API** - How will external sites use it?

### Testing Strategy
- **E2E tests FIRST** - Playwright with real APIs (no mocks)
- **Integration tests** - Component behavior with API stubs
- **Unit tests** - Pure functions and utilities
- **Storybook stories** - Visual documentation and manual testing

### Migration Sequence
1. **MVP embeddables** (Weeks 1-4) - Prove architecture
2. **Core screens** (Weeks 5-10) - Main user journeys
3. **Document management** (Weeks 11-12) - Critical workflow
4. **Polish & production** (Weeks 13-14) - Finalize Phase 1

---

**Last Updated**: October 21, 2025  
**Next Review**: End of MVP Sprint (Week 4)  
**Maintained By**: SpecKit specification process
