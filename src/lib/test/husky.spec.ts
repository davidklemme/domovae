import { describe, it, expect } from 'vitest';
import { readFile, access } from 'fs/promises';
import { join } from 'path';

describe('Husky Configuration', () => {
	describe('Pre-commit Hook', () => {
		it('should have pre-commit hook file', async () => {
			const hookPath = join(process.cwd(), '.husky', 'pre-commit');
			await expect(access(hookPath)).resolves.not.toThrow();
		});

		it('should have executable pre-commit hook', async () => {
			const hookPath = join(process.cwd(), '.husky', 'pre-commit');
			const content = await readFile(hookPath, 'utf-8');

			expect(content).toContain('#!/usr/bin/env sh');
			expect(content).toContain('pnpm run check');
			expect(content).toContain('pnpm run test');
			expect(content).toContain('pnpm run build');
		});

		it('should have commit-msg hook file', async () => {
			const hookPath = join(process.cwd(), '.husky', 'commit-msg');
			await expect(access(hookPath)).resolves.not.toThrow();
		});

		it('should validate commit message format', async () => {
			const hookPath = join(process.cwd(), '.husky', 'commit-msg');
			const content = await readFile(hookPath, 'utf-8');

			expect(content).toContain('conventional commit');
			expect(content).toContain('feat:');
			expect(content).toContain('fix:');
			expect(content).toContain('docs:');
		});
	});

	describe('Lint-staged Configuration', () => {
		it('should have lint-staged configuration in package.json', async () => {
			const packagePath = join(process.cwd(), 'package.json');
			const content = await readFile(packagePath, 'utf-8');
			const packageJson = JSON.parse(content);

			expect(packageJson['lint-staged']).toBeDefined();
		});

		it('should configure lint-staged for TypeScript files', async () => {
			const packagePath = join(process.cwd(), 'package.json');
			const content = await readFile(packagePath, 'utf-8');
			const packageJson = JSON.parse(content);

			expect(packageJson['lint-staged']['**/*.{ts,js}']).toBeDefined();
			expect(packageJson['lint-staged']['**/*.{ts,js}']).toContain('eslint --fix');
			expect(packageJson['lint-staged']['**/*.{ts,js}']).toContain('prettier --write');
		});

		it('should configure lint-staged for Svelte files', async () => {
			const packagePath = join(process.cwd(), 'package.json');
			const content = await readFile(packagePath, 'utf-8');
			const packageJson = JSON.parse(content);

			expect(packageJson['lint-staged']['**/*.svelte']).toBeDefined();
			expect(packageJson['lint-staged']['**/*.svelte']).toContain('eslint --fix');
			expect(packageJson['lint-staged']['**/*.svelte']).toContain('prettier --write');
		});
	});

	describe('Package.json Scripts', () => {
		it('should have prepare script for Husky', async () => {
			const packagePath = join(process.cwd(), 'package.json');
			const content = await readFile(packagePath, 'utf-8');
			const packageJson = JSON.parse(content);

			expect(packageJson.scripts.prepare).toBe('husky');
		});

		it('should have test scripts', async () => {
			const packagePath = join(process.cwd(), 'package.json');
			const content = await readFile(packagePath, 'utf-8');
			const packageJson = JSON.parse(content);

			expect(packageJson.scripts.test).toBeDefined();
			expect(packageJson.scripts['test:unit']).toBeDefined();
		});

		it('should have check and build scripts', async () => {
			const packagePath = join(process.cwd(), 'package.json');
			const content = await readFile(packagePath, 'utf-8');
			const packageJson = JSON.parse(content);

			expect(packageJson.scripts.check).toBeDefined();
			expect(packageJson.scripts.build).toBeDefined();
		});
	});
});
