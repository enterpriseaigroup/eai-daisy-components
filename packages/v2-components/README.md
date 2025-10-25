# @daisy/v2-components

DAISY V2 components for Configurator SDK v2.1.0+

## Purpose

This package contains V2 components generated from DAISY v1 baselines using the component migration pipeline. Each component is designed to work with the Configurator SDK v2.1.0+ and follows established patterns for state management, error handling, and UI composition.

## Installation

```bash
npm install @daisy/v2-components
```

## Peer Dependencies

```json
{
  "@elevenlabs-ui/configurator-sdk": "^2.1.0",
  "react": "^18.0.0",
  "react-dom": "^18.0.0"
}
```

## Usage

```typescript
import { GetAddressCard } from '@daisy/v2-components';

function MyApp() {
  return (
    <GetAddressCard
      onAddressSelected={(address) => console.log(address)}
    />
  );
}
```

## Component Catalog

### Tier 1: Simple Components

- **GetAddressCard**: Address lookup component with DPHI API integration

### Development

```bash
# Type checking
npm run typecheck

# Build
npm run build

# Clean
npm run clean
```

## Migration from DAISY v1

Components in this package are visual-only implementations generated from DAISY v1 baselines. Business logic is preserved as pseudo-code documentation for future integration.

For detailed migration notes, see each component's README.

## Architecture

- **Visual-Only Phase**: Current components implement UI/UX only
- **Business Logic Phase**: Future updates will integrate business logic from pseudo-code
- **Incremental Migration**: Enables gradual transition from v1 to v2

## License

MIT
