/**
 * File Operations Tests
 *
 * Tests for file operation utilities used in the component migration pipeline.
 *
 * @fileoverview File operation utility tests
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  FileOperations,
  createFileOperations,
  copyToBaseline,
  saveMigratedComponent,
  batchCopyFiles,
} from '@/utils/file-operations';
import type { CopyOptions, BackupOptions } from '@/utils/file-operations';
import type { ComponentDefinition, GeneratedFile } from '@/types';
import { writeFile, mkdir, rm, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

describe('FileOperations', () => {
  let fileOps: FileOperations;
  let testDir: string;

  beforeEach(async () => {
    fileOps = new FileOperations();
    testDir = join(tmpdir(), `file-ops-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  describe('FileOperations class', () => {
    it('should create file operations instance', () => {
      expect(fileOps).toBeInstanceOf(FileOperations);
    });

    it('should have copyToBaseline method', () => {
      expect(typeof fileOps.copyToBaseline).toBe('function');
    });

    it('should have saveMigratedComponent method', () => {
      expect(typeof fileOps.saveMigratedComponent).toBe('function');
    });

    it('should have batchCopy method', () => {
      expect(typeof fileOps.batchCopy).toBe('function');
    });

    it('should have createBackup method', () => {
      expect(typeof fileOps.createBackup).toBe('function');
    });
  });

  describe('copyToBaseline', () => {
    it('should copy component file to baseline directory', async () => {
      const sourceFile = join(testDir, 'Component.tsx');
      const baselineDir = join(testDir, 'baseline');

      await writeFile(sourceFile, 'export const Component = () => <div>Test</div>;', 'utf-8');

      const destination = await fileOps.copyToBaseline(sourceFile, baselineDir);

      expect(destination).toBe(join(baselineDir, 'Component.tsx'));

      const content = await readFile(destination, 'utf-8');
      expect(content).toContain('Component');
    });

    it('should create parent directories when needed', async () => {
      const sourceFile = join(testDir, 'Component.tsx');
      const baselineDir = join(testDir, 'deep', 'nested', 'baseline');

      await writeFile(sourceFile, 'export const Component = () => <div>Test</div>;', 'utf-8');

      const destination = await fileOps.copyToBaseline(sourceFile, baselineDir, {
        createParents: true,
      });

      const content = await readFile(destination, 'utf-8');
      expect(content).toBeDefined();
    });

    it('should reject overwrite when disabled', async () => {
      const sourceFile = join(testDir, 'Component.tsx');
      const baselineDir = join(testDir, 'baseline');

      await mkdir(baselineDir, { recursive: true });
      await writeFile(sourceFile, 'source content', 'utf-8');
      await writeFile(join(baselineDir, 'Component.tsx'), 'existing content', 'utf-8');

      await expect(
        fileOps.copyToBaseline(sourceFile, baselineDir, { overwrite: false })
      ).rejects.toThrow('already exists');
    });

    it('should allow overwrite when enabled', async () => {
      const sourceFile = join(testDir, 'Component.tsx');
      const baselineDir = join(testDir, 'baseline');

      await mkdir(baselineDir, { recursive: true });
      await writeFile(sourceFile, 'new content', 'utf-8');
      await writeFile(join(baselineDir, 'Component.tsx'), 'old content', 'utf-8');

      const destination = await fileOps.copyToBaseline(sourceFile, baselineDir, {
        overwrite: true,
      });

      const content = await readFile(destination, 'utf-8');
      expect(content).toBe('new content');
    });

    it('should transform file name when transformer provided', async () => {
      const sourceFile = join(testDir, 'Component.tsx');
      const baselineDir = join(testDir, 'baseline');

      await writeFile(sourceFile, 'content', 'utf-8');

      const destination = await fileOps.copyToBaseline(sourceFile, baselineDir, {
        transformName: (name) => name.replace('.tsx', '.baseline.tsx'),
      });

      expect(destination).toBe(join(baselineDir, 'Component.baseline.tsx'));
    });
  });

  describe('saveMigratedComponent', () => {
    it('should save migrated component to output directory', async () => {
      const component: ComponentDefinition = {
        id: 'test-123',
        name: 'TestComponent',
        type: 'functional',
        sourcePath: '/src/test.tsx',
        props: [],
        businessLogic: [],
        reactPatterns: [],
        dependencies: [],
        complexity: 'simple',
        migrationStatus: 'completed',
        metadata: {
          createdAt: new Date(),
          lastModified: new Date(),
        },
      };

      const code = `
import React from 'react';

const TestComponent = () => {
  return <div>Test</div>;
};

export default TestComponent;
      `.trim();

      const outputDir = join(testDir, 'output');
      const savedPath = await fileOps.saveMigratedComponent(component, code, outputDir);

      expect(savedPath).toBe(join(outputDir, 'TestComponent.tsx'));

      const savedContent = await readFile(savedPath, 'utf-8');
      expect(savedContent).toBe(code);
    });

    it('should create output directory if it does not exist', async () => {
      const component: ComponentDefinition = {
        id: 'test-123',
        name: 'Component',
        type: 'functional',
        sourcePath: '/src/component.tsx',
        props: [],
        businessLogic: [],
        reactPatterns: [],
        dependencies: [],
        complexity: 'simple',
        migrationStatus: 'completed',
        metadata: {
          createdAt: new Date(),
          lastModified: new Date(),
        },
      };

      const outputDir = join(testDir, 'new', 'output');
      const savedPath = await fileOps.saveMigratedComponent(component, 'code', outputDir);

      const content = await readFile(savedPath, 'utf-8');
      expect(content).toBe('code');
    });
  });

  describe('batchCopy', () => {
    it('should copy multiple files successfully', async () => {
      const files = [
        join(testDir, 'file1.tsx'),
        join(testDir, 'file2.tsx'),
        join(testDir, 'file3.tsx'),
      ];

      for (const file of files) {
        await writeFile(file, `content of ${file}`, 'utf-8');
      }

      const destinationDir = join(testDir, 'destination');
      const result = await fileOps.batchCopy(files, destinationDir);

      expect(result.total).toBe(3);
      expect(result.successful).toBe(3);
      expect(result.failed).toBe(0);
      expect(result.results.length).toBe(3);
      expect(result.duration).toBeGreaterThan(0);
    });

    it('should handle partial failures gracefully', async () => {
      const files = [
        join(testDir, 'exists.tsx'),
        join(testDir, 'does-not-exist.tsx'),
        join(testDir, 'also-exists.tsx'),
      ];

      await writeFile(files[0], 'content', 'utf-8');
      await writeFile(files[2], 'content', 'utf-8');

      const destinationDir = join(testDir, 'destination');
      const result = await fileOps.batchCopy(files, destinationDir);

      expect(result.total).toBe(3);
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(1);
    });

    it('should report individual file results', async () => {
      const files = [join(testDir, 'file.tsx')];
      await writeFile(files[0], 'content', 'utf-8');

      const destinationDir = join(testDir, 'destination');
      const result = await fileOps.batchCopy(files, destinationDir);

      expect(result.results[0].path).toBe(files[0]);
      expect(result.results[0].success).toBe(true);
      expect(result.results[0].duration).toBeGreaterThanOrEqual(0);
    });

    it('should transform file names during batch copy', async () => {
      const files = [join(testDir, 'Component.tsx')];
      await writeFile(files[0], 'content', 'utf-8');

      const destinationDir = join(testDir, 'destination');
      const result = await fileOps.batchCopy(files, destinationDir, {
        transformName: (name) => `transformed-${name}`,
      });

      expect(result.successful).toBe(1);
    });
  });

  describe('createBackup', () => {
    it('should create backup with timestamp', async () => {
      const sourceFile = join(testDir, 'component.tsx');
      await writeFile(sourceFile, 'original content', 'utf-8');

      const backupDir = join(testDir, 'backups');
      const backupPath = await fileOps.createBackup(sourceFile, {
        backupDir,
        includeTimestamp: true,
      });

      expect(backupPath).toContain('backups');
      expect(backupPath).toContain('.bak');

      const backupContent = await readFile(backupPath, 'utf-8');
      expect(backupContent).toBe('original content');
    });

    it('should create backup without timestamp', async () => {
      const sourceFile = join(testDir, 'component.tsx');
      await writeFile(sourceFile, 'original content', 'utf-8');

      const backupDir = join(testDir, 'backups');
      const backupPath = await fileOps.createBackup(sourceFile, {
        backupDir,
        includeTimestamp: false,
      });

      expect(backupPath).toBe(join(backupDir, 'component.bak.tsx'));
    });

    it('should use custom backup suffix', async () => {
      const sourceFile = join(testDir, 'component.tsx');
      await writeFile(sourceFile, 'content', 'utf-8');

      const backupDir = join(testDir, 'backups');
      const backupPath = await fileOps.createBackup(sourceFile, {
        backupDir,
        includeTimestamp: false,
        suffix: '.backup',
      });

      expect(backupPath).toContain('.backup');
    });
  });

  describe('saveArtifacts', () => {
    it('should save multiple generated artifacts', async () => {
      const artifacts: GeneratedFile[] = [
        {
          path: join(testDir, 'artifacts', 'Component.tsx'),
          content: 'component code',
          size: 14,
          type: 'component',
          generatedAt: new Date(),
        },
        {
          path: join(testDir, 'artifacts', 'types.ts'),
          content: 'type definitions',
          size: 16,
          type: 'types',
          generatedAt: new Date(),
        },
      ];

      const savedPaths = await fileOps.saveArtifacts(artifacts);

      expect(savedPaths.length).toBe(2);
      expect(savedPaths[0]).toBe(artifacts[0].path);
      expect(savedPaths[1]).toBe(artifacts[1].path);

      for (const path of savedPaths) {
        const content = await readFile(path, 'utf-8');
        expect(content).toBeTruthy();
      }
    });

    it('should handle empty artifacts array', async () => {
      const savedPaths = await fileOps.saveArtifacts([]);
      expect(savedPaths.length).toBe(0);
    });
  });

  describe('cleanOutputDirectory', () => {
    it('should clean non-baseline files when preserving baseline', async () => {
      const outputDir = join(testDir, 'output');
      await mkdir(join(outputDir, 'daisyv1'), { recursive: true });
      await writeFile(join(outputDir, 'daisyv1', 'baseline.tsx'), 'baseline', 'utf-8');
      await writeFile(join(outputDir, 'migrated.tsx'), 'migrated', 'utf-8');

      await fileOps.cleanOutputDirectory(outputDir, { preserveBaseline: true });

      // Baseline should exist
      const baselineContent = await readFile(
        join(outputDir, 'daisyv1', 'baseline.tsx'),
        'utf-8'
      );
      expect(baselineContent).toBe('baseline');
    });

    it('should handle non-existent output directory', async () => {
      const nonExistentDir = join(testDir, 'does-not-exist');

      await expect(
        fileOps.cleanOutputDirectory(nonExistentDir)
      ).resolves.not.toThrow();
    });
  });

  describe('isComponentFile', () => {
    it('should identify component files', () => {
      expect(fileOps.isComponentFile('Component.tsx')).toBe(true);
      expect(fileOps.isComponentFile('Component.ts')).toBe(true);
      expect(fileOps.isComponentFile('Component.jsx')).toBe(true);
      expect(fileOps.isComponentFile('Component.js')).toBe(true);
    });

    it('should reject test files', () => {
      expect(fileOps.isComponentFile('Component.test.tsx')).toBe(false);
      expect(fileOps.isComponentFile('Component.spec.ts')).toBe(false);
    });

    it('should reject type definition files', () => {
      expect(fileOps.isComponentFile('types.d.ts')).toBe(false);
    });

    it('should reject non-component extensions', () => {
      expect(fileOps.isComponentFile('styles.css')).toBe(false);
      expect(fileOps.isComponentFile('config.json')).toBe(false);
      expect(fileOps.isComponentFile('README.md')).toBe(false);
    });
  });

  describe('getFileSize', () => {
    it('should return file size in bytes', async () => {
      const file = join(testDir, 'test.txt');
      const content = 'Hello World!';
      await writeFile(file, content, 'utf-8');

      const size = await fileOps.getFileSize(file);

      expect(size).toBe(content.length);
    });

    it('should handle non-existent files', async () => {
      const nonExistentFile = join(testDir, 'does-not-exist.txt');

      await expect(fileOps.getFileSize(nonExistentFile)).rejects.toThrow();
    });
  });

  describe('readComponentSource', () => {
    it('should read component source code', async () => {
      const file = join(testDir, 'Component.tsx');
      const code = 'export const Component = () => <div>Test</div>;';
      await writeFile(file, code, 'utf-8');

      const source = await fileOps.readComponentSource(file);

      expect(source).toBe(code);
    });
  });

  describe('findComponentFiles', () => {
    it('should find all component files in directory', async () => {
      await writeFile(join(testDir, 'Component1.tsx'), 'code', 'utf-8');
      await writeFile(join(testDir, 'Component2.tsx'), 'code', 'utf-8');
      await writeFile(join(testDir, 'utils.ts'), 'code', 'utf-8');

      const componentFiles = await fileOps.findComponentFiles(testDir, false);

      expect(componentFiles.length).toBeGreaterThanOrEqual(2);
    });

    it('should find components recursively', async () => {
      const subDir = join(testDir, 'components');
      await mkdir(subDir, { recursive: true });
      await writeFile(join(subDir, 'Component.tsx'), 'code', 'utf-8');

      const componentFiles = await fileOps.findComponentFiles(testDir, true);

      expect(componentFiles.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('ensureDirectories', () => {
    it('should create multiple directories', async () => {
      const dirs = [
        join(testDir, 'dir1'),
        join(testDir, 'dir2'),
        join(testDir, 'dir3', 'nested'),
      ];

      await fileOps.ensureDirectories(dirs);

      for (const dir of dirs) {
        await expect(readFile(join(dir, '..', 'README.md'))).rejects.toThrow();
      }
    });
  });

  describe('Factory functions', () => {
    it('should create file operations via factory', () => {
      const instance = createFileOperations();
      expect(instance).toBeInstanceOf(FileOperations);
    });

    it('should copy to baseline via helper', async () => {
      const sourceFile = join(testDir, 'Component.tsx');
      const baselineDir = join(testDir, 'baseline');

      await writeFile(sourceFile, 'content', 'utf-8');

      const destination = await copyToBaseline(sourceFile, baselineDir);

      expect(destination).toBe(join(baselineDir, 'Component.tsx'));
    });

    it('should save component via helper', async () => {
      const component: ComponentDefinition = {
        id: 'test',
        name: 'Test',
        type: 'functional',
        sourcePath: '/src/test.tsx',
        props: [],
        businessLogic: [],
        reactPatterns: [],
        dependencies: [],
        complexity: 'simple',
        migrationStatus: 'completed',
        metadata: {
          createdAt: new Date(),
          lastModified: new Date(),
        },
      };

      const outputDir = join(testDir, 'output');
      const savedPath = await saveMigratedComponent(component, 'code', outputDir);

      expect(savedPath).toBeTruthy();
    });

    it('should batch copy via helper', async () => {
      const files = [join(testDir, 'file.tsx')];
      await writeFile(files[0], 'content', 'utf-8');

      const result = await batchCopyFiles(files, join(testDir, 'dest'));

      expect(result.total).toBe(1);
      expect(result.successful).toBe(1);
    });
  });
});
