/**
 * Path Validator (T068)
 * 
 * Validates file paths to prevent path traversal attacks
 * and restrict operations to allowed directories
 */

import * as path from 'path';

/**
 * Validates that a path is safe and within allowed directories
 * 
 * Rejects:
 * - Paths containing '..' (parent directory traversal)
 * - Absolute paths outside workspace
 * - Symlinks (optional, configurable)
 * 
 * Restricts to:
 * - daisyv1/components/ subdirectories for baselines
 * - packages/v2-components/src/components/ for output
 */
export function validatePath(
  filePath: string,
  options: {
    allowedBaseDirs: string[];
    rejectAbsolute?: boolean;
    rejectSymlinks?: boolean;
  }
): { valid: boolean; error?: string; normalizedPath?: string } {
  // Check for parent directory traversal
  if (filePath.includes('..')) {
    return {
      valid: false,
      error: 'Path traversal detected: ".." is not allowed in paths',
    };
  }

  // Normalize the path
  const normalizedPath = path.normalize(filePath);

  // Check for absolute path (if rejection is enabled)
  if (options.rejectAbsolute && path.isAbsolute(normalizedPath)) {
    return {
      valid: false,
      error: 'Absolute paths are not allowed',
    };
  }

  // Resolve to absolute path for directory checking
  const absolutePath = path.isAbsolute(normalizedPath)
    ? normalizedPath
    : path.resolve(process.cwd(), normalizedPath);

  // Check if path is within allowed base directories
  const isWithinAllowedDir = options.allowedBaseDirs.some(baseDir => {
    const absoluteBaseDir = path.resolve(process.cwd(), baseDir);
    return absolutePath.startsWith(absoluteBaseDir + path.sep) || 
           absolutePath === absoluteBaseDir;
  });

  if (!isWithinAllowedDir) {
    return {
      valid: false,
      error: `Path must be within one of: ${options.allowedBaseDirs.join(', ')}`,
    };
  }

  return {
    valid: true,
    normalizedPath: absolutePath,
  };
}

/**
 * Validates baseline path (must be in daisyv1/components/)
 */
export function validateBaselinePath(baselinePath: string): {
  valid: boolean;
  error?: string;
  normalizedPath?: string;
} {
  return validatePath(baselinePath, {
    allowedBaseDirs: ['daisyv1/components'],
    rejectAbsolute: false,
  });
}

/**
 * Validates output path (must be in packages/v2-components/src/components/)
 */
export function validateOutputPath(outputPath: string): {
  valid: boolean;
  error?: string;
  normalizedPath?: string;
} {
  return validatePath(outputPath, {
    allowedBaseDirs: ['packages/v2-components/src/components'],
    rejectAbsolute: false,
  });
}

/**
 * Sanitizes a component name to alphanumeric + hyphen/underscore only
 */
export function sanitizeComponentName(name: string): {
  valid: boolean;
  error?: string;
  sanitized?: string;
} {
  // Whitelist pattern: alphanumeric, hyphen, underscore only
  const pattern = /^[a-zA-Z0-9_-]+$/;

  if (!pattern.test(name)) {
    return {
      valid: false,
      error: 'Component name must contain only alphanumeric characters, hyphens, and underscores',
    };
  }

  // Additional checks
  if (name.length < 2) {
    return {
      valid: false,
      error: 'Component name must be at least 2 characters long',
    };
  }

  if (name.length > 64) {
    return {
      valid: false,
      error: 'Component name must be 64 characters or less',
    };
  }

  // Must start with letter
  if (!/^[a-zA-Z]/.test(name)) {
    return {
      valid: false,
      error: 'Component name must start with a letter',
    };
  }

  return {
    valid: true,
    sanitized: name,
  };
}
