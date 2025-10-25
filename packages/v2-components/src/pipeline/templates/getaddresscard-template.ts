/**
 * GetAddressCard-specific pseudo-code templates (T053-T056)
 *
 * Domain-specific templates for:
 * - Australian postcode validation
 * - Multiple LGA (Local Government Area) handling
 * - Property metadata display with GNAF data
 */

import type { PseudoCodeBlock } from '../../types/v2-component.js';

/**
 * T053: Orchestrator for GetAddressCard-specific pseudo-code generation
 */
export function generateGetAddressCardPseudoCode(): PseudoCodeBlock[] {
  const blocks: PseudoCodeBlock[] = [];

  blocks.push(generateAustralianPostcodeValidation());
  blocks.push(generateMultipleLGAHandling());
  blocks.push(generatePropertyMetadataDisplay());

  return blocks;
}

/**
 * T054: Generate Australian postcode validation pseudo-code
 *
 * WHY EXISTS: Validates Australian postcode format before NSW DPHI API call per GetAddressCard requirements
 *
 * Australian Postcode Format:
 * - 4 digits (numeric only)
 * - Valid ranges: 0200-0299, 0800-0999, 1000-9999
 * - NSW specific: 1000-2599, 2620-2899, 2921-2999
 *
 * Examples: 2000 (Sydney), 2795 (Bathurst), 2450 (Coffs Harbour)
 */
export function generateAustralianPostcodeValidation(): PseudoCodeBlock {
  return {
    functionName: 'validateAustralianPostcode',
    whyExists: 'Validates Australian postcode format before NSW DPHI API call per GetAddressCard requirements',
    whatItDoes: [
      'READ user input postcode from form field',
      'TRIM whitespace from input',
      'MATCH against Australian postcode pattern: /^(0[289][0-9]{2})|([1345689][0-9]{3})|(2[0-8][0-9]{2})|(290[0-9])|(291[0-4])|(7[0-4][0-9]{2})|(7[8-9][0-9]{2})$/',
      'IF pattern matches THEN validate length is exactly 4 digits',
      'IF pattern fails THEN display error: "Invalid Australian postcode. Must be 4 digits (e.g., 2000)"',
      'IF valid THEN proceed with API call',
      'EXAMPLES: "2000" (valid), "2795" (valid), "12345" (error - too long), "ABC" (error - not numeric)',
    ],
    whatItCalls: [],
    dataFlow: 'User input → Trim → Regex match → Length check → Validate range OR error → API call',
    dependencies: ['Australian postcode regex', 'Input component', 'Alert component for errors'],
    specialBehavior:
      'Accepts 4-digit numeric postcodes only. Validates against Australian postcode ranges. NSW postcodes prioritized (1000-2999 range).',
  };
}

/**
 * T055: Generate multiple LGA (Local Government Area) handling pseudo-code
 *
 * WHY EXISTS: Handles NSW DPHI responses with multiple LGA matches for boundary addresses
 *
 * NSW DPHI API may return multiple LGAs for addresses on council boundaries.
 * User must select correct LGA before proceeding.
 */
export function generateMultipleLGAHandling(): PseudoCodeBlock {
  return {
    functionName: 'handleMultipleLGAs',
    whyExists: 'Handles NSW DPHI responses with multiple LGA matches for boundary addresses',
    whatItDoes: [
      'RECEIVE API response with lga_name and lga_code fields',
      'IF single LGA THEN proceed with that LGA',
      'IF multiple LGAs THEN display selection UI',
      'MAP LGAs to RadioGroup options with LGA name and code',
      'DISPLAY Card with title: "Multiple councils found. Please select:"',
      'RENDER RadioGroup with LGA options (format: "LGA Name (Code: 12345)")',
      'ON radio selection: SET selectedLGA state',
      'DISPLAY confirm Button (disabled if no selection)',
      'ON confirm click: PROCEED with selected LGA',
      'IF user cancels: RETURN to address entry',
    ],
    whatItCalls: ['RadioGroup', 'Card', 'Button', 'useState'],
    dataFlow:
      'API response → Extract LGAs → Display list → User selects → State update → Confirm → Proceed with selected',
    dependencies: ['@/components/ui (RadioGroup, Card, Button)', 'useState hook'],
    specialBehavior:
      'Sorts LGAs alphabetically by name. Highlights recommended LGA (first in response) with badge. Cancel button returns to address entry without making selection.',
  };
}

/**
 * T056: Generate property metadata display pseudo-code
 *
 * WHY EXISTS: Displays complete property information from NSW DPHI API response with GNAF data
 *
 * Property metadata includes:
 * - Full address (street, suburb, state, postcode)
 * - GNAF PID (Geocoded National Address File Persistent Identifier)
 * - Lot/DP number (e.g., "78//DP870178")
 * - LGA (Local Government Area) name and code
 * - Coordinates (latitude/longitude)
 */
export function generatePropertyMetadataDisplay(): PseudoCodeBlock {
  return {
    functionName: 'displayPropertyMetadata',
    whyExists: 'Displays complete property information from NSW DPHI API response with GNAF data',
    whatItDoes: [
      'RECEIVE API response with property data',
      'EXTRACT fields: houseNumber, roadName, roadType, suburbName, postCode, gnafPid, parcelId, lgaName, lgaCode, latitude, longitude',
      'DISPLAY Card with CardHeader: "Property Details"',
      'RENDER address lines in structured layout:',
      '- Label: "Address" → Value: houseNumber + roadName + roadType',
      '- Value: suburbName + " " + state + " " + postCode',
      'RENDER GNAF PID with copy functionality:',
      '- Label: "GNAF PID" → Value: gnafPid',
      '- Button: "Copy" (icon) onClick: copy to clipboard',
      'RENDER Lot/DP if present:',
      '- Label: "Lot/DP" → Value: parcelId (format: "Lot 78 DP 870178")',
      '- Button: "Copy" (icon) onClick: copy to clipboard',
      'RENDER LGA: Label: "Council" → Value: lgaName + " (Code: " + lgaCode + ")"',
      'RENDER Coordinates: Label: "Location" → Value: latitude + ", " + longitude',
      'DISPLAY confirmation message after successful copy',
    ],
    whatItCalls: ['Card', 'CardHeader', 'CardContent', 'Label', 'Button', 'useToast'],
    dataFlow:
      'API response.data → Extract GNAF fields → Format layout → Render Card → User clicks copy → Clipboard API → Toast confirmation',
    dependencies: ['@/components/ui (Card, Label, Button)', 'Clipboard API', 'useToast'],
    specialBehavior:
      'Optional fields (parcelId, roadType) only rendered if present. Formats Lot/DP from "78//DP870178" to "Lot 78 DP 870178" for display. Copy buttons show checkmark animation on success. Toast auto-dismisses after 2 seconds.',
  };
}
