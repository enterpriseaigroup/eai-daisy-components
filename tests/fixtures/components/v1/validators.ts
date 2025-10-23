/**
 * Button validation utilities
 */

export interface ValidationError {
  field: string;
  message: string;
  severity: 'warning' | 'error';
}

export function validateButtonProps(props: {
  label?: string;
  variant?: string;
  size?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!props.label || props.label.trim().length === 0) {
    errors.push({
      field: 'label',
      message: 'Button label is required',
      severity: 'error',
    });
  }

  if (props.label && props.label.length > 50) {
    errors.push({
      field: 'label',
      message: 'Button label is too long (max 50 characters)',
      severity: 'warning',
    });
  }

  const validVariants = ['primary', 'secondary', 'danger'];
  if (props.variant && !validVariants.includes(props.variant)) {
    errors.push({
      field: 'variant',
      message: `Invalid variant: ${props.variant}`,
      severity: 'error',
    });
  }

  return errors;
}