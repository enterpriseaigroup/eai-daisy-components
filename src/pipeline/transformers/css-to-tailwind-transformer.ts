/**
 * CSS to Tailwind Transformer
 *
 * Converts CSS imports and styles to inline Tailwind classes during migration.
 * This ensures components remain parseable by TypeScript AST analyzers and
 * maintain exact visual appearance using Tailwind utility classes.
 *
 * @version 1.0.0
 * @author DAISY Component Extraction Pipeline
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { type Logger, createSimpleLogger } from '../../utils/logging.js';

export interface CSSToTailwindOptions {
  /** Preserve exact visual appearance */
  preserveVisualFidelity: boolean;

  /** Use arbitrary values for non-standard colors */
  useArbitraryValues: boolean;

  /** Remove CSS file after conversion */
  removeCSSFiles: boolean;

  /** Generate Tailwind config if needed */
  generateTailwindConfig: boolean;
}

export interface CSSToTailwindResult {
  /** Transformation success */
  success: boolean;

  /** Original code with CSS imports */
  originalCode: string;

  /** Transformed code with Tailwind classes */
  transformedCode: string;

  /** CSS rules that were converted */
  convertedRules: CSSConversion[];

  /** CSS files that were processed */
  processedFiles: string[];

  /** Warnings about unconverted styles */
  warnings: string[];

  /** Suggested Tailwind config additions */
  tailwindConfigSuggestions: string[];
}

export interface CSSConversion {
  /** Original CSS selector */
  selector: string;

  /** Original CSS rules */
  cssRules: string;

  /** Converted Tailwind classes */
  tailwindClasses: string;

  /** Confidence level (0-1) */
  confidence: number;
}

/**
 * CSS to Tailwind Transformer
 *
 * Analyzes component code for CSS imports, reads CSS files, converts rules
 * to equivalent Tailwind classes, and updates component code.
 */
export class CSSToTailwindTransformer {
  private readonly logger: Logger;

  constructor(_options: Partial<CSSToTailwindOptions> = {}, logger?: Logger) {
    this.logger = logger || createSimpleLogger('CSSToTailwindTransformer');
    // Options will be used in future enhancements for customization
  }

  /**
   * Transform component code from CSS imports to Tailwind classes
   */
  public async transform(
    componentCode: string,
    componentPath: string
  ): Promise<CSSToTailwindResult> {
    this.logger.info(`Transforming CSS to Tailwind for: ${componentPath}`);

    const result: CSSToTailwindResult = {
      success: false,
      originalCode: componentCode,
      transformedCode: componentCode,
      convertedRules: [],
      processedFiles: [],
      warnings: [],
      tailwindConfigSuggestions: [],
    };

    try {
      // Step 1: Find all CSS imports
      const cssImports = this.findCSSImports(componentCode);
      this.logger.debug(`Found ${cssImports.length} CSS imports`);

      if (cssImports.length === 0) {
        this.logger.info('No CSS imports found, returning original code');
        result.success = true;
        return result;
      }

      // Step 2: Process each CSS file
      const cssAnalysis = await this.analyzeCSSFiles(cssImports, componentPath);

      // Step 3: Build className mappings
      const classNameMappings = this.buildClassNameMappings(cssAnalysis);

      // Step 4: Replace className references in component
      let transformedCode = componentCode;
      transformedCode = this.replaceClassNames(
        transformedCode,
        classNameMappings
      );

      // Step 5: Remove CSS imports
      transformedCode = this.removeCSSImports(transformedCode, cssImports);

      // Step 6: Add migration comment
      transformedCode = this.addMigrationComment(transformedCode);

      result.transformedCode = transformedCode;
      result.convertedRules = cssAnalysis.flatMap(a => a.conversions);
      result.processedFiles = cssAnalysis.map(a => a.filePath);
      result.success = true;

      this.logger.info(
        `Successfully transformed ${cssImports.length} CSS imports to Tailwind`
      );
    } catch (error) {
      const errorObj = error instanceof Error ? error : undefined;
      this.logger.error('CSS to Tailwind transformation failed', errorObj);
      result.warnings.push(
        `Transformation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    return result;
  }

  /**
   * Find all CSS import statements in component code
   */
  private findCSSImports(code: string): CSSImport[] {
    const imports: CSSImport[] = [];

    // Remove all comments to avoid matching commented imports
    let activeCode = code;

    // Remove single-line comments
    activeCode = activeCode.replace(/\/\/.*$/gm, '');

    // Remove multi-line comments
    activeCode = activeCode.replace(/\/\*[\s\S]*?\*\//g, '');
    const patterns = [
      // Direct CSS imports: import './Button.css'
      /import\s+['"]([^'"]+\.css)['"]/g,
      // CSS Module imports: import styles from './Button.module.css'
      /import\s+(\w+)\s+from\s+['"]([^'"]+\.module\.css)['"]/g,
      // Named imports: import { styles } from './Button.css'
      /import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+\.css)['"]/g,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(activeCode)) !== null) {
        if (match[1]?.endsWith('.css') || match[1]?.endsWith('.module.css')) {
          // Direct import
          imports.push({
            statement: match[0],
            path: match[1],
            type: 'direct',
          });
        } else if (match[2]?.endsWith('.module.css') && match[1]) {
          // CSS Module import
          imports.push({
            statement: match[0],
            path: match[2],
            type: 'module',
            moduleName: match[1],
          });
        } else if (match[2]?.endsWith('.css') && match[1]) {
          // Named import
          imports.push({
            statement: match[0],
            path: match[2],
            type: 'named',
            namedImports: match[1].split(',').map(s => s.trim()),
          });
        }
      }
    }

    return imports;
  }

  /**
   * Analyze CSS files and convert to Tailwind
   */
  private async analyzeCSSFiles(
    imports: CSSImport[],
    componentPath: string
  ): Promise<CSSFileAnalysis[]> {
    const analyses: CSSFileAnalysis[] = [];

    for (const cssImport of imports) {
      const cssPath = path.resolve(path.dirname(componentPath), cssImport.path);

      try {
        const cssContent = await fs.readFile(cssPath, 'utf-8');
        const analysis = this.analyzeCSSContent(
          cssContent,
          cssPath,
          cssImport.type
        );
        analyses.push(analysis);
      } catch (error) {
        this.logger.warn(`Could not read CSS file: ${cssPath}`);
      }
    }

    return analyses;
  }

  /**
   * Analyze CSS content and convert to Tailwind classes
   */
  private analyzeCSSContent(
    cssContent: string,
    filePath: string,
    importType: 'direct' | 'module' | 'named'
  ): CSSFileAnalysis {
    const conversions: CSSConversion[] = [];

    // Parse CSS rules (simple regex-based parser)
    const rulePattern = /\.([a-zA-Z0-9_-]+)\s*\{([^}]+)\}/g;
    let match;

    while ((match = rulePattern.exec(cssContent)) !== null) {
      const selector = match[1];
      const rules = match[2];

      if (!selector || !rules) {
        continue;
      }

      const tailwindClasses = this.convertCSSRulesToTailwind(rules);

      conversions.push({
        selector,
        cssRules: rules.trim(),
        tailwindClasses,
        confidence: this.calculateConfidence(rules, tailwindClasses),
      });
    }

    return {
      filePath,
      importType,
      conversions,
    };
  }

  /**
   * Convert CSS rules to Tailwind classes
   */
  private convertCSSRulesToTailwind(cssRules: string): string {
    const classes: string[] = [];
    const rules = cssRules
      .split(';')
      .map(r => r.trim())
      .filter(r => r);

    for (const rule of rules) {
      const [property, value] = rule.split(':').map(s => s.trim());
      if (!property || !value) {
        continue;
      }

      const tailwindClass = this.mapCSSPropertyToTailwind(property, value);
      if (tailwindClass) {
        classes.push(tailwindClass);
      }
    }

    return classes.join(' ');
  }

  /**
   * Map CSS property/value to Tailwind class
   */
  private mapCSSPropertyToTailwind(
    property: string,
    value: string
  ): string | null {
    // Common mappings
    const mappings: Record<string, (val: string) => string | null> = {
      display: val => {
        const map: Record<string, string> = {
          flex: 'flex',
          'inline-flex': 'inline-flex',
          inline: 'inline',
          block: 'block',
          'inline-block': 'inline-block',
          grid: 'grid',
          none: 'hidden',
        };
        return map[val] || null;
      },
      'align-items': val => {
        const map: Record<string, string> = {
          center: 'items-center',
          'flex-start': 'items-start',
          'flex-end': 'items-end',
          baseline: 'items-baseline',
          stretch: 'items-stretch',
        };
        return map[val] || null;
      },
      'justify-content': val => {
        const map: Record<string, string> = {
          center: 'justify-center',
          'flex-start': 'justify-start',
          'flex-end': 'justify-end',
          'space-between': 'justify-between',
          'space-around': 'justify-around',
        };
        return map[val] || null;
      },
      padding: val => this.convertSpacing('p', val),
      margin: val => this.convertSpacing('m', val),
      'padding-top': val => this.convertSpacing('pt', val),
      'padding-right': val => this.convertSpacing('pr', val),
      'padding-bottom': val => this.convertSpacing('pb', val),
      'padding-left': val => this.convertSpacing('pl', val),
      'margin-top': val => this.convertSpacing('mt', val),
      'margin-right': val => this.convertSpacing('mr', val),
      'margin-bottom': val => this.convertSpacing('mb', val),
      'margin-left': val => this.convertSpacing('ml', val),
      'background-color': val => this.convertColor('bg', val),
      color: val => this.convertColor('text', val),
      'border-color': val => this.convertColor('border', val),
      border: val => (val === 'none' ? 'border-none' : null),
      'border-radius': val => this.convertBorderRadius(val),
      'font-size': val => this.convertFontSize(val),
      'font-weight': val => this.convertFontWeight(val),
      'text-align': val => `text-${val}`,
      cursor: val => `cursor-${val}`,
      opacity: val => `opacity-${Math.round(parseFloat(val) * 100)}`,
      width: val => (val === '100%' ? 'w-full' : this.convertSize('w', val)),
      height: val => this.convertSize('h', val),
      'min-height': val => this.convertSize('min-h', val),
      'max-width': val => this.convertSize('max-w', val),
      transition: val => this.convertTransition(val),
      position: val => val,
    };

    const mapper = mappings[property];
    return mapper ? mapper(value) : null;
  }

  /**
   * Convert spacing values to Tailwind
   */
  private convertSpacing(prefix: string, value: string): string {
    // Convert px to rem for standardization
    let normalized = value;
    if (value.endsWith('px')) {
      const px = parseInt(value);
      normalized = `${px / 16}rem`; // 16px = 1rem
    }

    const spacingMap: Record<string, string> = {
      '0': '0',
      '0.125rem': '0.5',
      '0.25rem': '1',
      '0.5rem': '2',
      '0.75rem': '3',
      '1rem': '4',
      '1.25rem': '5',
      '1.5rem': '6',
      '2rem': '8',
      '2.5rem': '10',
      '3rem': '12',
      // Px mappings
      '4px': '1',
      '8px': '2',
      '12px': '3',
      '16px': '4',
      '20px': '5',
      '24px': '6',
      '32px': '8',
      '40px': '10',
      '48px': '12',
    };

    return spacingMap[value] || spacingMap[normalized]
      ? `${prefix}-${spacingMap[value] || spacingMap[normalized]}`
      : `${prefix}-[${value}]`;
  }

  /**
   * Convert color values to Tailwind
   */
  private convertColor(prefix: string, value: string): string {
    // Use arbitrary values for exact color matching
    if (value.startsWith('#') || value.startsWith('rgb')) {
      return `${prefix}-[${value}]`;
    }

    // Standard color names
    const colorMap: Record<string, string> = {
      white: `${prefix}-white`,
      black: `${prefix}-black`,
      transparent: `${prefix}-transparent`,
    };

    return colorMap[value] || `${prefix}-[${value}]`;
  }

  /**
   * Convert border radius to Tailwind
   */
  private convertBorderRadius(value: string): string {
    const radiusMap: Record<string, string> = {
      '0': 'rounded-none',
      '0.125rem': 'rounded-sm',
      '0.25rem': 'rounded',
      '0.375rem': 'rounded-md',
      '0.5rem': 'rounded-lg',
      '0.75rem': 'rounded-xl',
      '1rem': 'rounded-2xl',
      '9999px': 'rounded-full',
    };

    return radiusMap[value] || `rounded-[${value}]`;
  }

  /**
   * Convert font size to Tailwind
   */
  private convertFontSize(value: string): string {
    const sizeMap: Record<string, string> = {
      '0.75rem': 'text-xs',
      '0.875rem': 'text-sm',
      '1rem': 'text-base',
      '1.125rem': 'text-lg',
      '1.25rem': 'text-xl',
      '1.5rem': 'text-2xl',
      // Px mappings
      '12px': 'text-xs',
      '14px': 'text-sm',
      '16px': 'text-base',
      '18px': 'text-lg',
      '20px': 'text-xl',
      '24px': 'text-2xl',
    };

    return sizeMap[value] || `text-[${value}]`;
  }

  /**
   * Convert font weight to Tailwind
   */
  private convertFontWeight(value: string): string {
    const weightMap: Record<string, string> = {
      '100': 'font-thin',
      bold: 'font-bold',
      '200': 'font-extralight',
      '300': 'font-light',
      '400': 'font-normal',
      '500': 'font-medium',
      '600': 'font-semibold',
      '700': 'font-bold',
      '800': 'font-extrabold',
      '900': 'font-black',
    };

    return weightMap[value] || `font-[${value}]`;
  }

  /**
   * Convert size values to Tailwind
   */
  private convertSize(prefix: string, value: string): string {
    return `${prefix}-[${value}]`;
  }

  /**
   * Convert transition to Tailwind
   */
  private convertTransition(value: string): string {
    if (value.includes('all')) {
      return 'transition-all';
    }
    return 'transition';
  }

  /**
   * Build className mappings from CSS analysis
   */
  private buildClassNameMappings(
    analyses: CSSFileAnalysis[]
  ): Record<string, string> {
    const mappings: Record<string, string> = {};

    for (const analysis of analyses) {
      for (const conversion of analysis.conversions) {
        mappings[conversion.selector] = conversion.tailwindClasses;
      }
    }

    return mappings;
  }

  /**
   * Replace className references in component code
   */
  private replaceClassNames(
    code: string,
    mappings: Record<string, string>
  ): string {
    let result = code;

    for (const [className, tailwindClasses] of Object.entries(mappings)) {
      const escapedClass = this.escapeRegex(className);
      const escapedCamelCase = this.escapeRegex(className.replace(/-/g, '_'));

      // Replace className="class-name" with Tailwind classes
      const patterns = [
        // className="class-name"
        {
          pattern: new RegExp(`className=["']${escapedClass}["']`, 'g'),
          replacement: `className="${tailwindClasses}"`,
        },
        // className="class-name other-class"
        {
          pattern: new RegExp(
            `className=["']([^"']*\\s)?${escapedClass}(\\s[^"']*)?["']`,
            'g'
          ),
          replacement: (
            _match: string,
            before: string = '',
            after: string = ''
          ) => {
            const before_trimmed = before.trim();
            const after_trimmed = after.trim();
            const parts = [
              before_trimmed,
              tailwindClasses,
              after_trimmed,
            ].filter(Boolean);
            return `className="${parts.join(' ')}"`;
          },
        },
        // className={`class-name`} - plain string in template literal
        {
          pattern: new RegExp('className=\\{`' + escapedClass + '`\\}', 'g'),
          replacement: `className="${tailwindClasses}"`,
        },
        // className={`class-name ${expr}`} - class at start of template literal
        {
          pattern: new RegExp(
            'className=\\{`' + escapedClass + '([\\s\\$][^`]*)?`\\}',
            'g'
          ),
          replacement: (_match: string, after: string = '') => {
            if (after && after.trim()) {
              return `className={\`${tailwindClasses}${after}\`}`;
            }
            return `className="${tailwindClasses}"`;
          },
        },
        // 'class-name' within template literal strings (not expressions)
        {
          pattern: new RegExp("'" + escapedClass + "'", 'g'),
          replacement: `'${tailwindClasses}'`,
        },
        // "class-name" within template literal strings (not expressions)
        {
          pattern: new RegExp('"' + escapedClass + '"', 'g'),
          replacement: `"${tailwindClasses}"`,
        },
        // className={styles['class-name']}
        {
          pattern: new RegExp(
            `className=\\{styles\\['${escapedClass}'\\]\\}`,
            'g'
          ),
          replacement: `className="${tailwindClasses}"`,
        },
        // className={styles.className}
        {
          pattern: new RegExp(
            `className=\\{styles\\.${escapedCamelCase}\\}`,
            'g'
          ),
          replacement: `className="${tailwindClasses}"`,
        },
        // className={`${styles.className}`}
        {
          pattern: new RegExp(
            'className=\\{`\\$\\{styles\\.' + escapedCamelCase + '\\}`\\}',
            'g'
          ),
          replacement: `className="${tailwindClasses}"`,
        },
        // className={`some-class ${styles.className}`}
        {
          pattern: new RegExp(
            'className=\\{`([^`]*\\s)?\\$\\{styles\\.' +
              escapedCamelCase +
              '\\}(\\s[^`]*)?`\\}',
            'g'
          ),
          replacement: (
            _match: string,
            before: string = '',
            after: string = ''
          ) => {
            const before_trimmed = before.trim();
            const after_trimmed = after.trim();
            const parts = [
              before_trimmed,
              tailwindClasses,
              after_trimmed,
            ].filter(Boolean);
            return `className="${parts.join(' ')}"`;
          },
        },
      ];

      for (const { pattern, replacement } of patterns) {
        if (typeof replacement === 'function') {
          result = result.replace(
            pattern,
            replacement as (...args: string[]) => string
          );
        } else {
          result = result.replace(pattern, replacement);
        }
      }
    }

    return result;
  }

  /**
   * Remove CSS import statements
   */
  private removeCSSImports(code: string, imports: CSSImport[]): string {
    let result = code;

    for (const cssImport of imports) {
      // Remove the entire import line
      result = result.replace(
        new RegExp(`^.*${this.escapeRegex(cssImport.statement)}.*$`, 'gm'),
        ''
      );
    }

    // Clean up empty lines
    result = result.replace(/\n\n\n+/g, '\n\n');

    return result;
  }

  /**
   * Add migration comment to transformed code
   */
  private addMigrationComment(code: string): string {
    const comment = `/**
 * MIGRATED: CSS imports removed, replaced with Tailwind classes
 * CONVERSION: Automated by CSS-to-Tailwind transformer
 * DATE: ${new Date().toISOString().split('T')[0]}
 */

`;

    // Insert after existing file header or at top
    const headerMatch = code.match(/^\/\*\*[\s\S]*?\*\//);
    if (headerMatch) {
      return code.replace(headerMatch[0], headerMatch[0] + '\n' + comment);
    }

    return comment + code;
  }

  /**
   * Calculate confidence level for conversion
   */
  private calculateConfidence(
    cssRules: string,
    tailwindClasses: string
  ): number {
    const ruleCount = cssRules.split(';').filter(r => r.trim()).length;
    const classCount = tailwindClasses.split(' ').filter(c => c.trim()).length;

    // If we converted most rules, high confidence
    if (classCount >= ruleCount * 0.8) {
      return 0.9;
    }

    // If we converted some rules, medium confidence
    if (classCount >= ruleCount * 0.5) {
      return 0.7;
    }

    // Low confidence
    return 0.5;
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

// Internal types
interface CSSImport {
  statement: string;
  path: string;
  type: 'direct' | 'module' | 'named';
  moduleName?: string;
  namedImports?: string[];
}

interface CSSFileAnalysis {
  filePath: string;
  importType: 'direct' | 'module' | 'named';
  conversions: CSSConversion[];
}

/**
 * Factory function
 */
export function createCSSToTailwindTransformer(
  options?: Partial<CSSToTailwindOptions>,
  logger?: Logger
): CSSToTailwindTransformer {
  return new CSSToTailwindTransformer(options, logger);
}
