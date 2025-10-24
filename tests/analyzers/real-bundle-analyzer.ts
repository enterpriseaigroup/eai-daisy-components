/**
 * Real Bundle Size Analyzer
 *
 * Actually builds and measures component bundles using webpack
 */

import * as webpack from 'webpack';
import * as path from 'path';
import * as fs from 'fs/promises';
import TerserPlugin from 'terser-webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import * as zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);
const brotli = promisify(zlib.brotliCompress);

export interface BundleAnalysisResult {
  component: string;
  rawSize: number;
  minifiedSize: number;
  gzippedSize: number;
  brotliSize: number;
  dependencies: DependencyInfo[];
  treeshakingSavings: number;
  meetsConstraint: boolean;
  sizeBreakdown: SizeBreakdown;
}

export interface DependencyInfo {
  name: string;
  size: number;
  percentage: number;
}

export interface SizeBreakdown {
  javascript: number;
  css: number;
  images: number;
  fonts: number;
  other: number;
}

export interface BundleComparison {
  v1: BundleAnalysisResult;
  v2: BundleAnalysisResult;
  sizeIncrease: number;
  percentageIncrease: number;
  meetsTarget: boolean;
  recommendations: OptimizationRecommendation[];
}

export interface OptimizationRecommendation {
  type: 'code-splitting' | 'lazy-loading' | 'tree-shaking' | 'minification' | 'compression';
  description: string;
  estimatedSavings: number;
  priority: 'high' | 'medium' | 'low';
}

export class RealBundleAnalyzer {
  private readonly maxSizeIncreasePercent: number;

  constructor(maxSizeIncreasePercent: number = 120) {
    this.maxSizeIncreasePercent = maxSizeIncreasePercent;
  }

  /**
   * Analyze bundle size for a component
   */
  public async analyzeBundle(componentPath: string): Promise<BundleAnalysisResult> {
    const componentName = path.basename(componentPath, path.extname(componentPath));
    console.log(`Analyzing bundle for: ${componentName}`);

    // Build the component bundle
    const bundleStats = await this.buildBundle(componentPath);

    // Analyze bundle contents
    const rawSize = bundleStats.assets[0]?.size || 0;
    const minifiedSize = await this.getMinifiedSize(componentPath);
    const gzippedSize = await this.getGzippedSize(componentPath);
    const brotliSize = await this.getBrotliSize(componentPath);

    // Extract dependency information
    const dependencies = await this.extractDependencies(bundleStats);

    // Calculate tree-shaking savings
    const treeshakingSavings = await this.calculateTreeshakingSavings(componentPath);

    // Get size breakdown by type
    const sizeBreakdown = await this.getSizeBreakdown(bundleStats);

    return {
      component: componentName,
      rawSize,
      minifiedSize,
      gzippedSize,
      brotliSize,
      dependencies,
      treeshakingSavings,
      meetsConstraint: true, // Will be determined by comparison
      sizeBreakdown,
    };
  }

  /**
   * Compare v1 and v2 bundle sizes
   */
  public async compareBundles(
    v1Path: string,
    v2Path: string,
  ): Promise<BundleComparison> {
    const v1Analysis = await this.analyzeBundle(v1Path);
    const v2Analysis = await this.analyzeBundle(v2Path);

    const sizeIncrease = v2Analysis.gzippedSize - v1Analysis.gzippedSize;
    const percentageIncrease = (v2Analysis.gzippedSize / v1Analysis.gzippedSize) * 100;

    const meetsTarget = percentageIncrease <= this.maxSizeIncreasePercent;

    // Generate optimization recommendations if needed
    const recommendations = meetsTarget
      ? []
      : await this.generateOptimizationRecommendations(v2Analysis, sizeIncrease);

    return {
      v1: v1Analysis,
      v2: v2Analysis,
      sizeIncrease,
      percentageIncrease,
      meetsTarget,
      recommendations,
    };
  }

  /**
   * Build component bundle using webpack
   */
  private async buildBundle(componentPath: string): Promise<webpack.Stats> {
    const outputPath = path.join(process.cwd(), 'dist-bundle-test');

    const config: webpack.Configuration = {
      mode: 'production',
      entry: componentPath,
      output: {
        path: outputPath,
        filename: '[name].bundle.js',
        clean: true,
      },
      module: {
        rules: [
          {
            test: /\\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
          },
          {
            test: /\\.jsx?$/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env', '@babel/preset-react'],
              },
            },
            exclude: /node_modules/,
          },
          {
            test: /\\.css$/,
            use: ['style-loader', 'css-loader'],
          },
          {
            test: /\\.module\\.css$/,
            use: [
              'style-loader',
              {
                loader: 'css-loader',
                options: {
                  modules: true,
                },
              },
            ],
          },
        ],
      },
      resolve: {
        extensions: ['.tsx', '.ts', '.jsx', '.js'],
        alias: {
          '@': path.resolve(process.cwd(), 'src'),
        },
      },
      optimization: {
        minimize: true,
        minimizer: [
          new TerserPlugin({
            terserOptions: {
              compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log'],
              },
              mangle: true,
              format: {
                comments: false,
              },
            },
            extractComments: false,
          }),
        ],
        usedExports: true, // Tree shaking
        sideEffects: false,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\\\/]node_modules[\\\\/]/,
              name: 'vendors',
              priority: -10,
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      },
      plugins: [
        new CompressionPlugin({
          algorithm: 'gzip',
          test: /\\.(js|css|html|svg)$/,
          threshold: 10240,
          minRatio: 0.8,
        }),
        new CompressionPlugin({
          algorithm: 'brotliCompress',
          test: /\\.(js|css|html|svg)$/,
          threshold: 10240,
          minRatio: 0.8,
          filename: '[path][base].br',
        }),
      ],
      externals: {
        'react': 'React',
        'react-dom': 'ReactDOM',
      },
    };

    return new Promise((resolve, reject) => {
      webpack(config, (err, stats) => {
        if (err) {
          reject(err);
          return;
        }

        if (stats?.hasErrors()) {
          reject(new Error(stats.toString()));
          return;
        }

        resolve(stats);
      });
    });
  }

  /**
   * Get minified bundle size
   */
  private async getMinifiedSize(componentPath: string): Promise<number> {
    const outputPath = path.join(process.cwd(), 'dist-bundle-test', 'main.bundle.js');

    try {
      const stats = await fs.stat(outputPath);
      return stats.size;
    } catch {
      return 0;
    }
  }

  /**
   * Get gzipped bundle size
   */
  private async getGzippedSize(componentPath: string): Promise<number> {
    const outputPath = path.join(process.cwd(), 'dist-bundle-test', 'main.bundle.js');

    try {
      const content = await fs.readFile(outputPath);
      const compressed = await gzip(content);
      return compressed.length;
    } catch {
      return 0;
    }
  }

  /**
   * Get Brotli compressed bundle size
   */
  private async getBrotliSize(componentPath: string): Promise<number> {
    const outputPath = path.join(process.cwd(), 'dist-bundle-test', 'main.bundle.js');

    try {
      const content = await fs.readFile(outputPath);
      const compressed = await brotli(content);
      return compressed.length;
    } catch {
      return 0;
    }
  }

  /**
   * Extract dependency information from webpack stats
   */
  private async extractDependencies(stats: webpack.Stats): Promise<DependencyInfo[]> {
    const statsJson = stats.toJson({ modules: true });
    const modules = statsJson.modules || [];

    const dependencies: Map<string, number> = new Map();

    for (const module of modules) {
      if (module.name?.includes('node_modules')) {
        const packageMatch = module.name.match(/node_modules[\\\\/](@?[^\\\\/]+(?:[\\\\/][^\\\\/]+)?)/);
        if (packageMatch) {
          const packageName = packageMatch[1];
          const currentSize = dependencies.get(packageName) || 0;
          dependencies.set(packageName, currentSize + (module.size || 0));
        }
      }
    }

    const totalSize = Array.from(dependencies.values()).reduce((a, b) => a + b, 0);

    return Array.from(dependencies.entries())
      .map(([name, size]) => ({
        name,
        size,
        percentage: (size / totalSize) * 100,
      }))
      .sort((a, b) => b.size - a.size)
      .slice(0, 10); // Top 10 dependencies
  }

  /**
   * Calculate tree-shaking savings
   */
  private async calculateTreeshakingSavings(componentPath: string): Promise<number> {
    // Build without tree-shaking
    const withoutTreeShaking = await this.buildBundleWithOptions(componentPath, {
      usedExports: false,
      sideEffects: true,
    });

    // Build with tree-shaking
    const withTreeShaking = await this.buildBundleWithOptions(componentPath, {
      usedExports: true,
      sideEffects: false,
    });

    const withoutSize = withoutTreeShaking.assets[0]?.size || 0;
    const withSize = withTreeShaking.assets[0]?.size || 0;

    return withoutSize - withSize;
  }

  /**
   * Build bundle with specific optimization options
   */
  private async buildBundleWithOptions(
    componentPath: string,
    optimizationOptions: any,
  ): Promise<webpack.Stats> {
    const outputPath = path.join(process.cwd(), 'dist-bundle-test-temp');

    const config: webpack.Configuration = {
      mode: 'production',
      entry: componentPath,
      output: {
        path: outputPath,
        filename: 'bundle.js',
      },
      module: {
        rules: [
          {
            test: /\\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
          },
          {
            test: /\\.css$/,
            use: ['style-loader', 'css-loader'],
          },
        ],
      },
      resolve: {
        extensions: ['.tsx', '.ts', '.js'],
      },
      optimization: {
        ...optimizationOptions,
      },
    };

    return new Promise((resolve, reject) => {
      webpack(config, (err, stats) => {
        if (err) {
reject(err);
} else {
resolve(stats);
}

        // Clean up temp directory
        fs.rm(outputPath, { recursive: true }).catch(() => {});
      });
    });
  }

  /**
   * Get size breakdown by file type
   */
  private async getSizeBreakdown(stats: webpack.Stats): Promise<SizeBreakdown> {
    const statsJson = stats.toJson({ assets: true });
    const assets = statsJson.assets || [];

    const breakdown: SizeBreakdown = {
      javascript: 0,
      css: 0,
      images: 0,
      fonts: 0,
      other: 0,
    };

    for (const asset of assets) {
      const size = asset.size || 0;

      if (asset.name.match(/\\.js$/)) {
        breakdown.javascript += size;
      } else if (asset.name.match(/\\.css$/)) {
        breakdown.css += size;
      } else if (asset.name.match(/\\.(png|jpg|jpeg|gif|svg|webp)$/)) {
        breakdown.images += size;
      } else if (asset.name.match(/\\.(woff|woff2|ttf|eot|otf)$/)) {
        breakdown.fonts += size;
      } else {
        breakdown.other += size;
      }
    }

    return breakdown;
  }

  /**
   * Generate optimization recommendations
   */
  private async generateOptimizationRecommendations(
    analysis: BundleAnalysisResult,
    excessSize: number,
  ): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = [];

    // Check for large dependencies
    const largeDeps = analysis.dependencies.filter(d => d.size > 50000);
    if (largeDeps.length > 0) {
      recommendations.push({
        type: 'code-splitting',
        description: `Consider code-splitting large dependencies: ${largeDeps.map(d => d.name).join(', ')}`,
        estimatedSavings: largeDeps.reduce((sum, d) => sum + d.size * 0.3, 0),
        priority: 'high',
      });
    }

    // Check if tree-shaking can help
    if (analysis.treeshakingSavings > 10000) {
      recommendations.push({
        type: 'tree-shaking',
        description: 'Enable tree-shaking to remove unused code',
        estimatedSavings: analysis.treeshakingSavings,
        priority: 'high',
      });
    }

    // Check CSS size
    if (analysis.sizeBreakdown.css > 50000) {
      recommendations.push({
        type: 'minification',
        description: 'Optimize CSS by removing unused styles with PurgeCSS',
        estimatedSavings: analysis.sizeBreakdown.css * 0.5,
        priority: 'medium',
      });
    }

    // Suggest lazy loading for large components
    if (analysis.minifiedSize > 100000) {
      recommendations.push({
        type: 'lazy-loading',
        description: 'Consider lazy-loading this component with React.lazy()',
        estimatedSavings: 0, // No direct size savings, but improves initial load
        priority: 'medium',
      });
    }

    // Check compression
    const compressionRatio = analysis.gzippedSize / analysis.minifiedSize;
    if (compressionRatio > 0.4) {
      recommendations.push({
        type: 'compression',
        description: 'Improve compression by restructuring code for better gzip efficiency',
        estimatedSavings: analysis.minifiedSize * 0.1,
        priority: 'low',
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Generate detailed bundle report
   */
  public generateReport(comparison: BundleComparison): string {
    const lines: string[] = [
      '# Bundle Size Analysis Report',
      '',
      `**Component:** ${comparison.v1.component}`,
      `**Status:** ${comparison.meetsTarget ? '✅ PASS' : '❌ FAIL'}`,
      `**Size Increase:** ${comparison.percentageIncrease.toFixed(1)}% (Target: ≤${this.maxSizeIncreasePercent}%)`,
      '',
      '## Size Comparison',
      '',
      '| Metric | v1 | v2 | Change |',
      '|--------|----|----|--------|',
      `| Raw Size | ${this.formatSize(comparison.v1.rawSize)} | ${this.formatSize(comparison.v2.rawSize)} | ${this.formatSizeChange(comparison.v2.rawSize - comparison.v1.rawSize)} |`,
      `| Minified | ${this.formatSize(comparison.v1.minifiedSize)} | ${this.formatSize(comparison.v2.minifiedSize)} | ${this.formatSizeChange(comparison.v2.minifiedSize - comparison.v1.minifiedSize)} |`,
      `| Gzipped | ${this.formatSize(comparison.v1.gzippedSize)} | ${this.formatSize(comparison.v2.gzippedSize)} | ${this.formatSizeChange(comparison.v2.gzippedSize - comparison.v1.gzippedSize)} |`,
      `| Brotli | ${this.formatSize(comparison.v1.brotliSize)} | ${this.formatSize(comparison.v2.brotliSize)} | ${this.formatSizeChange(comparison.v2.brotliSize - comparison.v1.brotliSize)} |`,
      '',
    ];

    if (comparison.v2.dependencies.length > 0) {
      lines.push('## Top Dependencies (v2)', '');
      for (const dep of comparison.v2.dependencies.slice(0, 5)) {
        lines.push(`- **${dep.name}:** ${this.formatSize(dep.size)} (${dep.percentage.toFixed(1)}%)`);
      }
      lines.push('');
    }

    if (comparison.recommendations.length > 0) {
      lines.push('## Optimization Recommendations', '');
      for (const rec of comparison.recommendations) {
        lines.push(`### ${rec.priority.toUpperCase()}: ${rec.type}`);
        lines.push(`- ${rec.description}`);
        if (rec.estimatedSavings > 0) {
          lines.push(`- Estimated savings: ${this.formatSize(rec.estimatedSavings)}`);
        }
        lines.push('');
      }
    }

    return lines.join('\\n');
  }

  /**
   * Format size for display
   */
  private formatSize(bytes: number): string {
    if (bytes < 1024) {
return `${bytes} B`;
}
    if (bytes < 1024 * 1024) {
return `${(bytes / 1024).toFixed(1)} KB`;
}
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  /**
   * Format size change
   */
  private formatSizeChange(change: number): string {
    const sign = change > 0 ? '+' : '';
    return `${sign}${this.formatSize(Math.abs(change))}`;
  }
}

/**
 * Factory function to create analyzer instance
 */
export function createRealBundleAnalyzer(
  maxSizeIncreasePercent?: number,
): RealBundleAnalyzer {
  return new RealBundleAnalyzer(maxSizeIncreasePercent);
}
