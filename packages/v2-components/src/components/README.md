# GetAddressCard Component

**Version**: 2.0.0
**Migration Status**: Migrated from DAISY v1 `useRenderAddressCard`
**API Integration**: NSW DPHI Address Location Service via Public API Proxy

## Overview

The `GetAddressCard` component provides Australian address lookup functionality using the NSW Department of Planning, Housing and Infrastructure (DPHI) Address Location Service. It supports both street address search and lot/DP number lookups with GNAF (Geocoded National Address File) data integration.

## Features

- **Address Search**: Lookup addresses by street name, suburb, and postcode
- **Lot/DP Search**: Find addresses by lot number and deposited plan number
- **Australian Postcode Validation**: Validates 4-digit postcodes against Australian ranges
- **GNAF Integration**: Returns GNAF PIDs, coordinates, and LGA information
- **Copy to Clipboard**: Easy copying of GNAF PID and Lot/DP data
- **Session-Based Auth**: Uses HTTP-only cookies from PayloadCMS (no manual token management)

## Usage

### Basic Example

```tsx
import { GetAddressCard } from '@eai/v2-components';
import '@eai/v2-components/dist/GetAddressCard.css';

function MyComponent() {
  return (
    <GetAddressCard
      apiBaseUrl="https://api.example.com"
      onAddressSelected={(address) => {
        console.log('Selected address:', address);
      }}
    />
  );
}
```

### With Lot Number Search

```tsx
<GetAddressCard
  apiBaseUrl="https://api.example.com"
  enableLotSearch={true}
  onAddressSelected={(address) => {
    // Handle address selection
    console.log('GNAF PID:', address.gnafPid);
    console.log('Lot/DP:', address.parcelId);
  }}
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `apiBaseUrl` | `string` | Yes | - | Public API base URL (e.g., `https://api.example.com`) |
| `onAddressSelected` | `(address: NSWAddressData) => void` | No | - | Callback when address is successfully retrieved |
| `enableLotSearch` | `boolean` | No | `false` | Enable lot number search tab |
| `className` | `string` | No | `''` | CSS class name for custom styling |

## NSWAddressData Interface

```typescript
interface NSWAddressData {
  streetNumber?: string;
  streetName: string;
  streetType?: string;
  suburb: string;
  state: string;
  postcode: string;
  gnafPid: string;           // GNAF Persistent Identifier
  parcelId?: string;         // Format: "78//DP870178"
  lotNumber?: string;        // Extracted from parcelId
  dpNumber?: string;         // Deposited Plan number
  latitude: string;
  longitude: string;
  lgaName: string;           // Local Government Area name
  lgaCode: string;           // LGA numeric code
  addressString: string;     // Full formatted address
}
```

## API Integration

### Public API Proxy Request

The component calls the public API proxy endpoint:

```http
POST /api/v1/proxy
Content-Type: application/json
Cookie: payload-token=<session-jwt>

{
  "tenantApiName": "DPHI_NSW",
  "operation": "getaddress",
  "parameters": {
    "houseNumber": "346",
    "roadName": "Panorama",
    "roadType": "Ave",
    "suburb": "Bathurst",
    "postCode": "2795"
  }
}
```

### Expected Response

```json
{
  "data": {
    "streetNumber": "346",
    "streetName": "PANORAMA",
    "streetType": "AVENUE",
    "suburb": "BATHURST",
    "state": "NSW",
    "postcode": "2795",
    "gnafPid": "GANSW718616256",
    "parcelId": "78//DP870178",
    "lotNumber": "78",
    "dpNumber": "870178",
    "latitude": "-33.4142",
    "longitude": "149.5785",
    "lgaName": "BATHURST REGIONAL",
    "lgaCode": "10500",
    "addressString": "346 PANORAMA AVENUE BATHURST NSW 2795"
  }
}
```

## Validation

### Australian Postcode Validation

The component validates Australian postcodes using the following regex:

```javascript
/^(0[289][0-9]{2})|([1345689][0-9]{3})|(2[0-8][0-9]{2})|(290[0-9])|(291[0-4])|(7[0-4][0-9]{2})|(7[8-9][0-9]{2})$/
```

**Valid NSW Postcodes**: 1000-2599, 2620-2899, 2921-2999

### Form Validation Rules

**Address Search**:
- `roadName` is required
- Either `suburb` or `postCode` must be provided
- `postCode` must be 4 digits if provided

**Lot Search**:
- `lotNumber` is required
- `dpNumber` is required
- `suburb` is optional

## Styling

### Default Styles

Import the default CSS:

```tsx
import '@eai/v2-components/dist/GetAddressCard.css';
```

### Custom Styling

Apply custom styles using the `className` prop:

```tsx
<GetAddressCard
  apiBaseUrl="https://api.example.com"
  className="custom-address-card"
/>
```

```css
.custom-address-card {
  max-width: 800px;
  border-radius: 12px;
}

.custom-address-card .submit-btn {
  background: #10b981;
}
```

## Authentication

The component uses **session-based authentication** via HTTP-only cookies. Users must be authenticated with PayloadCMS before using this component.

**No manual token management required** - the browser automatically includes the `payload-token` cookie with API requests.

## Error Handling

The component handles the following error scenarios:

- **401 Unauthorized**: User session expired (redirect to login)
- **422 Validation Error**: Invalid form inputs (display error message)
- **429 Rate Limit**: NSW DPHI rate limit exceeded (5 req/min)
- **404 Not Found**: No address found matching criteria

Example error handling:

```tsx
<GetAddressCard
  apiBaseUrl="https://api.example.com"
  onAddressSelected={(address) => {
    console.log('Success:', address);
  }}
/>
```

Errors are displayed inline below the form with red background and error icon.

## Dependencies

- `react` (^18.0.0)
- `@tanstack/react-query` (^5.0.0)

## Migration Notes

### Changes from DAISY v1

**v1 Component**: `useRenderAddressCard`
- **Purpose**: Display existing address card in chat interface
- **API**: Internal DI container (`IRenderAddressCardUseCase`)
- **Returns**: `ChatMessage` object

**v2 Component**: `GetAddressCard`
- **Purpose**: Lookup and validate NSW addresses via DPHI API
- **API**: Public API proxy (`/api/v1/proxy`)
- **Returns**: `NSWAddressData` with GNAF fields

**Key Differences**:
- UK postcodes → Australian postcodes
- UPRN → GNAF PID
- Council → LGA (Local Government Area)
- Added lot/DP number search
- Session-based auth instead of DI container

## Examples

### Example 1: Address Search

```tsx
import { GetAddressCard } from '@eai/v2-components';

function AddressLookup() {
  const handleSelect = (address) => {
    console.log('Selected:', address.addressString);
    console.log('GNAF PID:', address.gnafPid);
    console.log('LGA:', address.lgaName);
  };

  return (
    <GetAddressCard
      apiBaseUrl={process.env.REACT_APP_API_URL}
      onAddressSelected={handleSelect}
    />
  );
}
```

### Example 2: Lot Number Search

```tsx
<GetAddressCard
  apiBaseUrl="https://api.example.com"
  enableLotSearch={true}
  onAddressSelected={(address) => {
    if (address.parcelId) {
      // Format: "78//DP870178" → "Lot 78 DP 870178"
      console.log('Lot/DP:', address.lotNumber, address.dpNumber);
    }
  }}
/>
```

## Testing

### Manual Testing

1. Start the public API locally (see `eai-public-api` quickstart guide)
2. Ensure PayloadCMS session cookie is set
3. Test address search:
   - Enter: "346 Panorama Ave, Bathurst, 2795"
   - Verify GNAF PID is returned
4. Test lot search:
   - Enter: Lot 78, DP 870178
   - Verify address details are displayed

### Integration Testing

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GetAddressCard } from './GetAddressCard';

test('searches address and displays results', async () => {
  const mockOnSelect = jest.fn();

  render(
    <GetAddressCard
      apiBaseUrl="http://localhost:8000"
      onAddressSelected={mockOnSelect}
    />
  );

  fireEvent.change(screen.getByLabelText('Road Name'), {
    target: { value: 'Panorama' },
  });
  fireEvent.change(screen.getByLabelText('Suburb'), {
    target: { value: 'Bathurst' },
  });

  fireEvent.click(screen.getByText('Search Address'));

  await waitFor(() => {
    expect(screen.getByText(/Property Details/i)).toBeInTheDocument();
  });

  expect(mockOnSelect).toHaveBeenCalledWith(
    expect.objectContaining({
      gnafPid: expect.any(String),
      lgaName: expect.any(String),
    })
  );
});
```

## Resources

- [NSW DPHI Address Location Service](http://maps.six.nsw.gov.au/sws/AddressLocation.html)
- [GNAF Data Documentation](https://geoscape.com.au/data/g-naf/)
- [NSW Planning Portal APIs](https://www.planningportal.nsw.gov.au/API)
- [Public API Contract](../../eai-public-api/.specify/specs/001-auth-api-gateway/contracts/dphi-nsw-contract.md)

## Support

For issues or questions:
- GitHub Issues: [eai-daisy-components/issues](https://github.com/enterpriseaigroup/eai-daisy-components/issues)
- Documentation: [Component Library Docs](https://docs.example.com/components/getaddresscard)
