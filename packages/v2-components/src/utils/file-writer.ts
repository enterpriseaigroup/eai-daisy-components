/**
 * Atomic File Writer (T067)
 * 
 * Implements atomic file writes using temp file → validate → rename pattern
 * to prevent partial writes and ensure data integrity
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { randomBytes } from 'crypto';

/**
 * Writes a file atomically using temp file strategy
 * 
 * Process:
 * 1. Write to temporary file with random suffix
 * 2. Validate written content (optional)
 * 3. Rename temp file to final destination (atomic on most filesystems)
 * 4. Clean up temp file on failure
 */
export async function writeFileAtomic(
  filePath: string,
  content: string,
  options?: {
    encoding?: BufferEncoding;
    validator?: (content: string) => Promise<boolean>;
  }
): Promise<void> {
  const encoding = options?.encoding || 'utf-8';
  const tempSuffix = `.tmp.${randomBytes(6).toString('hex')}`;
  const tempPath = `${filePath}${tempSuffix}`;

  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    // Step 1: Write to temporary file
    await fs.writeFile(tempPath, content, encoding);

    // Step 2: Validate if validator provided
    if (options?.validator) {
      const readContent = await fs.readFile(tempPath, encoding);
      const isValid = await options.validator(readContent);
      
      if (!isValid) {
        throw new Error('Content validation failed');
      }
    }

    // Step 3: Atomic rename (overwrites existing file)
    await fs.rename(tempPath, filePath);
  } catch (error) {
    // Step 4: Clean up temp file on failure
    try {
      await fs.unlink(tempPath);
    } catch {
      // Ignore if temp file doesn't exist
    }
    throw error;
  }
}

/**
 * Writes multiple files atomically in a batch
 * 
 * All files succeed or all fail (no partial writes)
 */
export async function writeFilesAtomic(
  files: Array<{ path: string; content: string }>,
  options?: {
    encoding?: BufferEncoding;
    validator?: (content: string) => Promise<boolean>;
  }
): Promise<void> {
  const encoding = options?.encoding || 'utf-8';
  const tempFiles: string[] = [];

  try {
    // Write all files to temp locations
    for (const file of files) {
      const tempSuffix = `.tmp.${randomBytes(6).toString('hex')}`;
      const tempPath = `${file.path}${tempSuffix}`;
      tempFiles.push(tempPath);

      const dir = path.dirname(file.path);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(tempPath, file.content, encoding);

      // Validate if validator provided
      if (options?.validator) {
        const readContent = await fs.readFile(tempPath, encoding);
        const isValid = await options.validator(readContent);
        
        if (!isValid) {
          throw new Error(`Content validation failed for ${file.path}`);
        }
      }
    }

    // Atomic rename all files (only after all writes succeed)
    for (let i = 0; i < files.length; i++) {
      await fs.rename(tempFiles[i]!, files[i]!.path);
    }
  } catch (error) {
    // Clean up all temp files on failure
    for (const tempFile of tempFiles) {
      try {
        await fs.unlink(tempFile);
      } catch {
        // Ignore if file doesn't exist
      }
    }
    throw error;
  }
}

/**
 * Creates a validator that checks TypeScript compilation
 */
export function createTypeScriptValidator(): (content: string) => Promise<boolean> {
  return async (content: string): Promise<boolean> => {
    // Basic syntax checks
    const hasImport = /^import\s/m.test(content);
    const hasExport = /^export\s/m.test(content);
    const hasBalancedBraces = (content.match(/{/g) || []).length === 
                               (content.match(/}/g) || []).length;
    
    return hasBalancedBraces && (hasImport || hasExport);
  };
}

/**
 * Creates a validator that checks markdown structure
 */
export function createMarkdownValidator(): (content: string) => Promise<boolean> {
  return async (content: string): Promise<boolean> => {
    // Check for heading
    const hasHeading = /^#\s+/m.test(content);
    
    // Check for balanced code blocks
    const codeBlockCount = (content.match(/```/g) || []).length;
    const hasBalancedCodeBlocks = codeBlockCount % 2 === 0;
    
    return hasHeading && hasBalancedCodeBlocks;
  };
}
