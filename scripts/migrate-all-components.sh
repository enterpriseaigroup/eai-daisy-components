#!/usr/bin/env bash
# Batch Migration Script for All DAISY v1 Components
#
# This script migrates all tier1-simple components to V2 architecture
# and generates a comprehensive validation report.
#
# Usage: ./scripts/migrate-all-components.sh [--dry-run] [--verbose]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASELINE_DIR="daisyv1/components/tier1-simple"
OUTPUT_DIR="packages/v2-components/src/components"
REPORT_DIR=".specify/reports"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="${REPORT_DIR}/migration_report_${TIMESTAMP}.md"

# Flags
DRY_RUN=false
VERBOSE=false
SKIP_TESTS=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    --skip-tests)
      SKIP_TESTS=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--dry-run] [--verbose] [--skip-tests]"
      exit 1
      ;;
  esac
done

# Create report directory
mkdir -p "${REPORT_DIR}"

# Initialize report
cat > "${REPORT_FILE}" << EOF
# V2 Component Migration Report

**Generated**: $(date)
**Mode**: $([ "$DRY_RUN" = true ] && echo "Dry Run" || echo "Production")
**Baseline**: ${BASELINE_DIR}
**Output**: ${OUTPUT_DIR}

## Summary

| Metric | Count |
|--------|-------|
| Total Components | TBD |
| Successful | TBD |
| Failed | TBD |
| Skipped | TBD |

## Component Details

EOF

# Counters
total=0
successful=0
failed=0
skipped=0

# Arrays to track results
declare -a success_list
declare -a failure_list
declare -a skip_list

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}V2 Component Batch Migration${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Baseline: ${BASELINE_DIR}"
echo "Output: ${OUTPUT_DIR}"
echo "Report: ${REPORT_FILE}"
echo ""

# Discover all components
echo -e "${YELLOW}Discovering components...${NC}"
echo ""

# Find all useRender* directories with .tsx files
for component_dir in ${BASELINE_DIR}/useRender*; do
  if [ ! -d "${component_dir}" ]; then
    continue
  fi
  
  # Extract component name from directory (remove "useRender" prefix)
  dir_name=$(basename "${component_dir}")
  component_name="${dir_name#useRender}"
  
  # Check if component file exists
  component_file="${component_dir}/${component_name}.tsx"
  if [ ! -f "${component_file}" ]; then
    # Try alternate patterns
    component_file="${component_dir}/${component_name}.ts"
    if [ ! -f "${component_file}" ]; then
      echo -e "${YELLOW}⊘ Skipping ${component_name} - no source file found${NC}"
      ((skipped++))
      skip_list+=("${component_name}: No source file")
      continue
    fi
  fi
  
  ((total++))
  
  echo -e "${BLUE}[${total}] Processing: ${component_name}${NC}"
  
  # Build migration command
  cmd="npm run migrate:v2 -- --component=${component_name}"
  [ "$DRY_RUN" = true ] && cmd="${cmd} --dry-run"
  [ "$VERBOSE" = true ] && cmd="${cmd} --verbose"
  [ "$SKIP_TESTS" = true ] && cmd="${cmd} --skip-tests"
  
  # Run migration
  if output=$(eval "${cmd} 2>&1"); then
    echo -e "${GREEN}✓ Success: ${component_name}${NC}"
    ((successful++))
    success_list+=("${component_name}")
    
    # Add to report
    cat >> "${REPORT_FILE}" << EOF
### ✅ ${component_name}

**Status**: Success
**Baseline**: \`${component_file}\`
**Generated**: \`${OUTPUT_DIR}/${component_name}/${component_name}.tsx\`

EOF
  else
    exit_code=$?
    echo -e "${RED}✗ Failed: ${component_name} (exit code: ${exit_code})${NC}"
    ((failed++))
    
    # Extract error message
    error_msg=$(echo "${output}" | grep -E "(error|Error|ERROR|✗)" | head -5)
    failure_list+=("${component_name}: Exit ${exit_code}")
    
    # Add to report
    cat >> "${REPORT_FILE}" << EOF
### ❌ ${component_name}

**Status**: Failed (Exit Code: ${exit_code})
**Baseline**: \`${component_file}\`

**Error**:
\`\`\`text
${error_msg}
\`\`\`

EOF
  fi
  
  echo ""
done

# Update summary in report
summary="| Total Components | ${total} |
| Successful | ${successful} |
| Failed | ${failed} |
| Skipped | ${skipped} |"

# Use sed to update the summary table
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i '' "/| Total Components | TBD |/,/| Skipped | TBD |/c\\
${summary}
" "${REPORT_FILE}"
else
  # Linux
  sed -i "/| Total Components | TBD |/,/| Skipped | TBD |/c\\${summary}" "${REPORT_FILE}"
fi

# Add lists to report
if [ ${#success_list[@]} -gt 0 ]; then
  echo "" >> "${REPORT_FILE}"
  echo "## Successful Migrations" >> "${REPORT_FILE}"
  echo "" >> "${REPORT_FILE}"
  for comp in "${success_list[@]}"; do
    echo "- ✅ ${comp}" >> "${REPORT_FILE}"
  done
fi

if [ ${#failure_list[@]} -gt 0 ]; then
  echo "" >> "${REPORT_FILE}"
  echo "## Failed Migrations" >> "${REPORT_FILE}"
  echo "" >> "${REPORT_FILE}"
  for comp in "${failure_list[@]}"; do
    echo "- ❌ ${comp}" >> "${REPORT_FILE}"
  done
fi

if [ ${#skip_list[@]} -gt 0 ]; then
  echo "" >> "${REPORT_FILE}"
  echo "## Skipped Components" >> "${REPORT_FILE}"
  echo "" >> "${REPORT_FILE}"
  for comp in "${skip_list[@]}"; do
    echo "- ⊘ ${comp}" >> "${REPORT_FILE}"
  done
fi

# Add recommendations
cat >> "${REPORT_FILE}" << EOF

## Recommendations

### For Failed Components

1. Review error messages above
2. Check if baseline files have complex business logic (requires 15+ specific statements)
3. Consider using \`--skip-tests\` flag for simple UI components
4. Manually validate pseudo-code completeness

### For Skipped Components

1. Verify source file exists and has correct naming
2. Check if component follows expected directory structure
3. Move files to \`useRender{ComponentName}/{ComponentName}.tsx\` pattern if needed

### Next Steps

1. Review generated components in \`${OUTPUT_DIR}\`
2. Run integration tests: \`pnpm test -- tests/integration/v2-generation.test.ts\`
3. Validate TypeScript compilation: \`pnpm run typecheck\`
4. Manual QA for failed components

EOF

# Print final summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Migration Complete${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Total Components:  ${total}"
echo -e "${GREEN}Successful:        ${successful}${NC}"
echo -e "${RED}Failed:            ${failed}${NC}"
echo -e "${YELLOW}Skipped:           ${skipped}${NC}"
echo ""
echo "Success Rate: $(awk "BEGIN {printf \"%.1f\", (${successful}/${total})*100}")%"
echo ""
echo -e "${BLUE}Report saved to: ${REPORT_FILE}${NC}"
echo ""

# Exit with error if any failures
if [ ${failed} -gt 0 ]; then
  exit 1
fi
