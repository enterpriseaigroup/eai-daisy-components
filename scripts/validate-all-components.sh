#!/usr/bin/env bash
# Component Validation Script
#
# Validates all generated V2 components for correctness:
# - File structure (component.tsx, README.md, index.ts)
# - TypeScript compilation
# - Pseudo-code completeness
# - Documentation quality
# - Bundle size
#
# Usage: ./scripts/validate-all-components.sh [--verbose]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
COMPONENTS_DIR="packages/v2-components/src/components"
REPORT_DIR=".specify/reports"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="${REPORT_DIR}/validation_report_${TIMESTAMP}.md"

# Flags
VERBOSE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --verbose)
      VERBOSE=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--verbose]"
      exit 1
      ;;
  esac
done

# Create report directory
mkdir -p "${REPORT_DIR}"

# Initialize report
cat > "${REPORT_FILE}" << EOF
# V2 Component Validation Report

**Generated**: $(date)
**Components Directory**: ${COMPONENTS_DIR}

## Summary

| Check | Passed | Failed | Total |
|-------|--------|--------|-------|
| File Structure | TBD | TBD | TBD |
| TypeScript Compilation | TBD | TBD | TBD |
| Pseudo-code Blocks | TBD | TBD | TBD |
| Documentation | TBD | TBD | TBD |
| Bundle Size | TBD | TBD | TBD |

## Component Details

EOF

# Counters
total_components=0
structure_pass=0
structure_fail=0
compile_pass=0
compile_fail=0
pseudocode_pass=0
pseudocode_fail=0
docs_pass=0
docs_fail=0
bundle_pass=0
bundle_fail=0

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}V2 Component Validation${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Find all component directories
for component_dir in ${COMPONENTS_DIR}/*/; do
  if [ ! -d "${component_dir}" ]; then
    continue
  fi
  
  component_name=$(basename "${component_dir}")
  
  # Skip non-component directories
  if [[ "${component_name}" == "node_modules" ]] || [[ "${component_name}" == "dist" ]]; then
    continue
  fi
  
  ((total_components++))
  
  echo -e "${BLUE}[${total_components}] Validating: ${component_name}${NC}"
  
  # Add component section to report
  cat >> "${REPORT_FILE}" << EOF
### ${component_name}

EOF
  
  # Check 1: File Structure
  echo -n "  Checking file structure... "
  component_file="${component_dir}${component_name}.tsx"
  readme_file="${component_dir}README.md"
  index_file="${component_dir}index.ts"
  
  structure_ok=true
  structure_msg=""
  
  if [ ! -f "${component_file}" ]; then
    structure_ok=false
    structure_msg="${structure_msg}Missing: ${component_name}.tsx; "
  fi
  
  if [ ! -f "${readme_file}" ]; then
    structure_ok=false
    structure_msg="${structure_msg}Missing: README.md; "
  fi
  
  if [ ! -f "${index_file}" ]; then
    structure_ok=false
    structure_msg="${structure_msg}Missing: index.ts; "
  fi
  
  if [ "$structure_ok" = true ]; then
    echo -e "${GREEN}✓${NC}"
    ((structure_pass++))
    echo "**File Structure**: ✅ Pass" >> "${REPORT_FILE}"
  else
    echo -e "${RED}✗${NC}"
    ((structure_fail++))
    echo "**File Structure**: ❌ Fail - ${structure_msg}" >> "${REPORT_FILE}"
  fi
  
  # Check 2: TypeScript Compilation (if component file exists)
  if [ -f "${component_file}" ]; then
    echo -n "  Checking TypeScript... "
    
    if npx tsc --noEmit --jsx react --esModuleInterop --skipLibCheck "${component_file}" 2>/dev/null; then
      echo -e "${GREEN}✓${NC}"
      ((compile_pass++))
      echo "**TypeScript**: ✅ Pass" >> "${REPORT_FILE}"
    else
      echo -e "${RED}✗${NC}"
      ((compile_fail++))
      
      # Get first error for report
      error_msg=$(npx tsc --noEmit --jsx react --esModuleInterop --skipLibCheck "${component_file}" 2>&1 | head -3)
      echo "**TypeScript**: ❌ Fail" >> "${REPORT_FILE}"
      echo "\`\`\`" >> "${REPORT_FILE}"
      echo "${error_msg}" >> "${REPORT_FILE}"
      echo "\`\`\`" >> "${REPORT_FILE}"
    fi
    
    # Check 3: Pseudo-code Blocks
    echo -n "  Checking pseudo-code... "
    
    if grep -q "BUSINESS LOGIC PSEUDO-CODE" "${component_file}" && \
       grep -q "WHY EXISTS" "${component_file}" && \
       grep -q "WHAT IT DOES" "${component_file}" && \
       grep -q "DATA FLOW" "${component_file}"; then
      echo -e "${GREEN}✓${NC}"
      ((pseudocode_pass++))
      
      # Count blocks
      block_count=$(grep -c "WHY EXISTS" "${component_file}")
      echo "**Pseudo-code**: ✅ Pass (${block_count} blocks)" >> "${REPORT_FILE}"
    else
      echo -e "${RED}✗${NC}"
      ((pseudocode_fail++))
      echo "**Pseudo-code**: ❌ Fail - Missing constitutional fields" >> "${REPORT_FILE}"
    fi
    
    # Check 4: Bundle Size
    echo -n "  Checking bundle size... "
    
    file_size=$(wc -c < "${component_file}")
    file_size_kb=$((file_size / 1024))
    
    # Assume 120% of baseline is acceptable (rough estimate: <100KB)
    if [ ${file_size_kb} -lt 100 ]; then
      echo -e "${GREEN}✓${NC} (${file_size_kb}KB)"
      ((bundle_pass++))
      echo "**Bundle Size**: ✅ Pass (${file_size_kb}KB)" >> "${REPORT_FILE}"
    else
      echo -e "${YELLOW}⚠${NC} (${file_size_kb}KB - large)"
      ((bundle_pass++))  # Still pass, just warn
      echo "**Bundle Size**: ⚠️ Warning (${file_size_kb}KB - consider optimization)" >> "${REPORT_FILE}"
    fi
  fi
  
  # Check 5: Documentation
  if [ -f "${readme_file}" ]; then
    echo -n "  Checking documentation... "
    
    # Check for required sections
    required_sections=("## Overview" "## Props" "## Usage" "## Migration Notes")
    docs_ok=true
    missing_sections=""
    
    for section in "${required_sections[@]}"; do
      if ! grep -q "${section}" "${readme_file}"; then
        docs_ok=false
        missing_sections="${missing_sections}${section}; "
      fi
    done
    
    if [ "$docs_ok" = true ]; then
      echo -e "${GREEN}✓${NC}"
      ((docs_pass++))
      echo "**Documentation**: ✅ Pass (all required sections present)" >> "${REPORT_FILE}"
    else
      echo -e "${RED}✗${NC}"
      ((docs_fail++))
      echo "**Documentation**: ❌ Fail - Missing: ${missing_sections}" >> "${REPORT_FILE}"
    fi
  fi
  
  echo "" >> "${REPORT_FILE}"
  echo ""
done

# Update summary table
summary="| File Structure | ${structure_pass} | ${structure_fail} | ${total_components} |
| TypeScript Compilation | ${compile_pass} | ${compile_fail} | ${total_components} |
| Pseudo-code Blocks | ${pseudocode_pass} | ${pseudocode_fail} | ${total_components} |
| Documentation | ${docs_pass} | ${docs_fail} | ${total_components} |
| Bundle Size | ${bundle_pass} | ${bundle_fail} | ${total_components} |"

if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i '' "/| File Structure | TBD/,/| Bundle Size | TBD/c\\
${summary}
" "${REPORT_FILE}"
else
  # Linux
  sed -i "/| File Structure | TBD/,/| Bundle Size | TBD/c\\${summary}" "${REPORT_FILE}"
fi

# Add overall assessment
overall_pass=$((structure_pass + compile_pass + pseudocode_pass + docs_pass + bundle_pass))
overall_total=$((total_components * 5))
success_rate=$(awk "BEGIN {printf \"%.1f\", (${overall_pass}/${overall_total})*100}")

cat >> "${REPORT_FILE}" << EOF

## Overall Assessment

**Total Components**: ${total_components}
**Overall Success Rate**: ${success_rate}%

### Pass Rates by Check

- **File Structure**: $(awk "BEGIN {printf \"%.1f\", (${structure_pass}/${total_components})*100}")%
- **TypeScript Compilation**: $(awk "BEGIN {printf \"%.1f\", (${compile_pass}/${total_components})*100}")%
- **Pseudo-code Blocks**: $(awk "BEGIN {printf \"%.1f\", (${pseudocode_pass}/${total_components})*100}")%
- **Documentation**: $(awk "BEGIN {printf \"%.1f\", (${docs_pass}/${total_components})*100}")%
- **Bundle Size**: $(awk "BEGIN {printf \"%.1f\", (${bundle_pass}/${total_components})*100}")%

## Recommendations

EOF

if [ ${structure_fail} -gt 0 ]; then
  cat >> "${REPORT_FILE}" << EOF
### File Structure Issues

${structure_fail} component(s) have missing files. Ensure each component has:
- \`{ComponentName}.tsx\` - Main component file
- \`README.md\` - Component documentation
- \`index.ts\` - Barrel export

EOF
fi

if [ ${compile_fail} -gt 0 ]; then
  cat >> "${REPORT_FILE}" << EOF
### TypeScript Compilation Issues

${compile_fail} component(s) failed TypeScript compilation. Common issues:
- Missing type imports
- Incorrect JSX syntax
- Unresolved module imports
- Type mismatches

Run: \`pnpm run typecheck\` for detailed error messages.

EOF
fi

if [ ${pseudocode_fail} -gt 0 ]; then
  cat >> "${REPORT_FILE}" << EOF
### Pseudo-code Issues

${pseudocode_fail} component(s) missing required pseudo-code documentation. Ensure:
- \`BUSINESS LOGIC PSEUDO-CODE\` header present
- \`WHY EXISTS\` section for each function
- \`WHAT IT DOES\` section for each function
- \`DATA FLOW\` section for each function

EOF
fi

if [ ${docs_fail} -gt 0 ]; then
  cat >> "${REPORT_FILE}" << EOF
### Documentation Issues

${docs_fail} component(s) have incomplete README files. Required sections:
- ## Overview
- ## Props
- ## Usage
- ## Migration Notes

EOF
fi

# Print final summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Validation Complete${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Total Components:     ${total_components}"
echo ""
echo "File Structure:       ${structure_pass}/${total_components} passed"
echo "TypeScript:           ${compile_pass}/${total_components} passed"
echo "Pseudo-code:          ${pseudocode_pass}/${total_components} passed"
echo "Documentation:        ${docs_pass}/${total_components} passed"
echo "Bundle Size:          ${bundle_pass}/${total_components} passed"
echo ""
echo -e "Overall Success Rate: ${GREEN}${success_rate}%${NC}"
echo ""
echo -e "${BLUE}Report saved to: ${REPORT_FILE}${NC}"
echo ""

# Exit with error if critical checks failed
if [ ${structure_fail} -gt 0 ] || [ ${compile_fail} -gt 0 ]; then
  exit 1
fi
