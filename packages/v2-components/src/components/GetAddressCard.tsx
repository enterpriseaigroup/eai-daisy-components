/**
 * GetAddressCard Component - NSW Address Lookup
 *
 * Provides Australian address lookup functionality using NSW DPHI API via public API proxy.
 * Supports address search and lot/DP number lookups with GNAF data integration.
 *
 * @version 2.0.0
 * @migrated-from daisyv1/components/tier1-simple/useRenderAddressCard
 */

import React, { useState } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Component Props
 */
export interface GetAddressCardProps {
  /** Public API base URL */
  apiBaseUrl: string;
  /** Callback when address is successfully retrieved */
  onAddressSelected?: (address: NSWAddressData) => void;
  /** Enable lot number search (default: false) */
  enableLotSearch?: boolean;
  /** CSS class name for custom styling */
  className?: string;
}

/**
 * Address Search Parameters
 */
interface AddressSearchParams {
  houseNumber?: string;
  roadName: string;
  roadType?: string;
  suburb?: string;
  postCode?: string;
}

/**
 * Lot Number Search Parameters
 */
interface LotSearchParams {
  lotNumber: string;
  dpNumber: string;
  suburb?: string;
}

/**
 * NSW Address Data (GNAF format)
 */
export interface NSWAddressData {
  streetNumber?: string;
  streetName: string;
  streetType?: string;
  suburb: string;
  state: string;
  postcode: string;
  gnafPid: string;
  parcelId?: string;
  lotNumber?: string;
  dpNumber?: string;
  latitude: string;
  longitude: string;
  lgaName: string;
  lgaCode: string;
  addressString: string;
}

/**
 * LGA (Local Government Area) Selection
 * @future Used for handling multiple LGA matches on boundary addresses
 */
// interface LGAOption {
//   name: string;
//   code: string;
// }

/**
 * Form State
 */
interface AddressFormState {
  houseNumber: string;
  roadName: string;
  roadType: string;
  suburb: string;
  postCode: string;
  lotNumber: string;
  dpNumber: string;
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * T054: Australian Postcode Validation
 *
 * WHY EXISTS: Validates Australian postcode format before NSW DPHI API call
 *
 * WHAT IT DOES:
 * - Validates 4-digit numeric postcodes
 * - Checks against Australian postcode ranges
 * - NSW postcodes: 1000-2599, 2620-2899, 2921-2999
 */
function validateAustralianPostcode(postcode: string): { valid: boolean; error?: string } {
  const trimmed = postcode.trim();

  if (trimmed.length === 0) {
    return { valid: true }; // Optional field
  }

  if (trimmed.length !== 4) {
    return { valid: false, error: 'Postcode must be exactly 4 digits' };
  }

  const postcodeRegex =
    /^(0[289][0-9]{2})|([1345689][0-9]{3})|(2[0-8][0-9]{2})|(290[0-9])|(291[0-4])|(7[0-4][0-9]{2})|(7[8-9][0-9]{2})$/;

  if (!postcodeRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid Australian postcode (e.g., 2000, 2795)' };
  }

  return { valid: true };
}

/**
 * Validate address form inputs
 */
function validateAddressForm(form: Partial<AddressFormState>): { valid: boolean; error?: string } {
  if (!form.roadName || form.roadName.trim().length === 0) {
    return { valid: false, error: 'Road name is required' };
  }

  if (!form.suburb && !form.postCode) {
    return { valid: false, error: 'Either suburb or postcode is required' };
  }

  if (form.postCode) {
    const postcodeValidation = validateAustralianPostcode(form.postCode);
    if (!postcodeValidation.valid) {
      return postcodeValidation;
    }
  }

  return { valid: true };
}

/**
 * Validate lot search form
 */
function validateLotForm(form: Partial<AddressFormState>): { valid: boolean; error?: string } {
  if (!form.lotNumber || form.lotNumber.trim().length === 0) {
    return { valid: false, error: 'Lot number is required' };
  }

  if (!form.dpNumber || form.dpNumber.trim().length === 0) {
    return { valid: false, error: 'DP number is required' };
  }

  return { valid: true };
}

// ============================================================================
// API INTEGRATION
// ============================================================================

/**
 * Call public API proxy for address lookup
 */
async function fetchAddressFromAPI(
  apiBaseUrl: string,
  params: AddressSearchParams
): Promise<NSWAddressData> {
  const response = await fetch(`${apiBaseUrl}/api/v1/proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include session cookie
    body: JSON.stringify({
      tenantApiName: 'DPHI_NSW',
      operation: 'getaddress',
      parameters: params,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
}

/**
 * Call public API proxy for lot number lookup
 */
async function fetchAddressByLot(
  apiBaseUrl: string,
  params: LotSearchParams
): Promise<NSWAddressData> {
  const response = await fetch(`${apiBaseUrl}/api/v1/proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      tenantApiName: 'DPHI_NSW',
      operation: 'getaddressbylot',
      parameters: params,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function GetAddressCard({
  apiBaseUrl,
  onAddressSelected,
  enableLotSearch = false,
  className = '',
}: GetAddressCardProps) {
  // State management
  const [searchMode, setSearchMode] = useState<'address' | 'lot'>('address');
  const [formState, setFormState] = useState<AddressFormState>({
    houseNumber: '',
    roadName: '',
    roadType: '',
    suburb: '',
    postCode: '',
    lotNumber: '',
    dpNumber: '',
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const [addressData, setAddressData] = useState<NSWAddressData | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Address search handler
  async function performAddressSearch(params: AddressSearchParams) {
    setIsSearching(true);
    try {
      const data = await fetchAddressFromAPI(apiBaseUrl, params);
      handleAddressResponse(data);
    } catch (error) {
      const err = error as Error;
      setValidationError(err.message);
      setAddressData(null);
    } finally {
      setIsSearching(false);
    }
  }

  // Lot number search handler
  async function performLotSearch(params: LotSearchParams) {
    setIsSearching(true);
    try {
      const data = await fetchAddressByLot(apiBaseUrl, params);
      handleAddressResponse(data);
    } catch (error) {
      const err = error as Error;
      setValidationError(err.message);
      setAddressData(null);
    } finally {
      setIsSearching(false);
    }
  }

  /**
   * T055: Handle Multiple LGAs
   *
   * WHY EXISTS: Handles NSW DPHI responses with multiple LGA matches for boundary addresses
   */
  function handleAddressResponse(data: NSWAddressData) {
    // For now, single LGA only - future: detect multiple LGAs in response
    setAddressData(data);
    setValidationError(null);

    if (onAddressSelected) {
      onAddressSelected(data);
    }
  }

  /**
   * Handle form input changes
   */
  function handleInputChange(field: keyof AddressFormState, value: string) {
    setFormState((prev) => ({ ...prev, [field]: value }));
    setValidationError(null); // Clear validation error on input
  }

  /**
   * Handle address search submission
   */
  function handleAddressSearch(e: React.FormEvent) {
    e.preventDefault();

    const validation = validateAddressForm(formState);
    if (!validation.valid) {
      setValidationError(validation.error!);
      return;
    }

    const params: AddressSearchParams = {
      roadName: formState.roadName.trim(),
    };

    if (formState.houseNumber) params.houseNumber = formState.houseNumber.trim();
    if (formState.roadType) params.roadType = formState.roadType.trim();
    if (formState.suburb) params.suburb = formState.suburb.trim();
    if (formState.postCode) params.postCode = formState.postCode.trim();

    performAddressSearch(params);
  }

  /**
   * Handle lot number search submission
   */
  function handleLotSearch(e: React.FormEvent) {
    e.preventDefault();

    const validation = validateLotForm(formState);
    if (!validation.valid) {
      setValidationError(validation.error!);
      return;
    }

    const params: LotSearchParams = {
      lotNumber: formState.lotNumber.trim(),
      dpNumber: formState.dpNumber.trim(),
    };

    if (formState.suburb) params.suburb = formState.suburb.trim();

    performLotSearch(params);
  }

  /**
   * T056: Format Lot/DP for Display
   *
   * Formats "78//DP870178" to "Lot 78 DP 870178"
   */
  function formatLotDP(parcelId: string): string {
    const match = parcelId.match(/^(\d+)\/\/DP(\d+)$/i);
    if (match) {
      return `Lot ${match[1]} DP ${match[2]}`;
    }
    return parcelId;
  }

  /**
   * Copy text to clipboard with toast notification
   */
  async function copyToClipboard(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${label} copied to clipboard!`); // Replace with proper toast in production
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  const isLoading = isSearching;

  return (
    <div className={`getaddress-card ${className}`}>
      {/* Search Mode Toggle */}
      {enableLotSearch && (
        <div className="search-mode-toggle mb-4">
          <button
            type="button"
            className={`mode-btn ${searchMode === 'address' ? 'active' : ''}`}
            onClick={() => setSearchMode('address')}
          >
            Address Search
          </button>
          <button
            type="button"
            className={`mode-btn ${searchMode === 'lot' ? 'active' : ''}`}
            onClick={() => setSearchMode('lot')}
          >
            Lot/DP Search
          </button>
        </div>
      )}

      {/* Address Search Form */}
      {searchMode === 'address' && (
        <form onSubmit={handleAddressSearch} className="address-form">
          <h3 className="form-title">NSW Address Lookup</h3>

          <div className="form-group">
            <label htmlFor="houseNumber">House Number</label>
            <input
              type="text"
              id="houseNumber"
              value={formState.houseNumber}
              onChange={(e) => handleInputChange('houseNumber', e.target.value)}
              placeholder="346"
            />
          </div>

          <div className="form-group">
            <label htmlFor="roadName">
              Road Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="roadName"
              value={formState.roadName}
              onChange={(e) => handleInputChange('roadName', e.target.value)}
              placeholder="Panorama"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="roadType">Road Type</label>
            <input
              type="text"
              id="roadType"
              value={formState.roadType}
              onChange={(e) => handleInputChange('roadType', e.target.value)}
              placeholder="Ave, Street, Road"
            />
          </div>

          <div className="form-group">
            <label htmlFor="suburb">Suburb</label>
            <input
              type="text"
              id="suburb"
              value={formState.suburb}
              onChange={(e) => handleInputChange('suburb', e.target.value)}
              placeholder="Bathurst"
            />
          </div>

          <div className="form-group">
            <label htmlFor="postCode">Postcode</label>
            <input
              type="text"
              id="postCode"
              value={formState.postCode}
              onChange={(e) => handleInputChange('postCode', e.target.value)}
              placeholder="2795"
              maxLength={4}
            />
            <small className="help-text">4 digits (e.g., 2000, 2795)</small>
          </div>

          {validationError && <div className="error-message">{validationError}</div>}

          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? 'Searching...' : 'Search Address'}
          </button>
        </form>
      )}

      {/* Lot/DP Search Form */}
      {searchMode === 'lot' && (
        <form onSubmit={handleLotSearch} className="lot-form">
          <h3 className="form-title">Lot/DP Number Lookup</h3>

          <div className="form-group">
            <label htmlFor="lotNumber">
              Lot Number <span className="required">*</span>
            </label>
            <input
              type="text"
              id="lotNumber"
              value={formState.lotNumber}
              onChange={(e) => handleInputChange('lotNumber', e.target.value)}
              placeholder="78"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dpNumber">
              DP Number <span className="required">*</span>
            </label>
            <input
              type="text"
              id="dpNumber"
              value={formState.dpNumber}
              onChange={(e) => handleInputChange('dpNumber', e.target.value)}
              placeholder="870178"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="suburbLot">Suburb (optional)</label>
            <input
              type="text"
              id="suburbLot"
              value={formState.suburb}
              onChange={(e) => handleInputChange('suburb', e.target.value)}
              placeholder="Bathurst"
            />
          </div>

          {validationError && <div className="error-message">{validationError}</div>}

          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? 'Searching...' : 'Search Lot/DP'}
          </button>
        </form>
      )}

      {/* T056: Property Metadata Display */}
      {addressData && (
        <div className="property-details">
          <h3 className="details-title">Property Details</h3>

          {/* Address */}
          <div className="detail-row">
            <label className="detail-label">Address</label>
            <div className="detail-value">{addressData.addressString}</div>
          </div>

          {/* GNAF PID */}
          <div className="detail-row">
            <label className="detail-label">GNAF PID</label>
            <div className="detail-value">
              <span>{addressData.gnafPid}</span>
              <button
                type="button"
                className="copy-btn"
                onClick={() => copyToClipboard(addressData.gnafPid, 'GNAF PID')}
                title="Copy GNAF PID"
              >
                📋
              </button>
            </div>
          </div>

          {/* Lot/DP */}
          {addressData.parcelId && (
            <div className="detail-row">
              <label className="detail-label">Lot/DP</label>
              <div className="detail-value">
                <span>{formatLotDP(addressData.parcelId)}</span>
                <button
                  type="button"
                  className="copy-btn"
                  onClick={() => copyToClipboard(addressData.parcelId!, 'Lot/DP')}
                  title="Copy Lot/DP"
                >
                  📋
                </button>
              </div>
            </div>
          )}

          {/* Council/LGA */}
          <div className="detail-row">
            <label className="detail-label">Council</label>
            <div className="detail-value">
              {addressData.lgaName} (Code: {addressData.lgaCode})
            </div>
          </div>

          {/* Coordinates */}
          <div className="detail-row">
            <label className="detail-label">Location</label>
            <div className="detail-value">
              {addressData.latitude}, {addressData.longitude}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GetAddressCard;
